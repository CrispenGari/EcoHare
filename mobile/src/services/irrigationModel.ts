// services/irrigationModel.ts

import { Asset } from "expo-asset";
import * as ort from "onnxruntime-react-native";
import mobileMetadataJson from "@/assets/models/mobile_preprocessing.json";
import {
  MobileMetadata,
  IrrigationFeatures,
  FeatureExplanation,
  IrrigationPrediction,
} from "../types";
const MODEL_ASSET = require("@/assets/models/irrigation_mlp.onnx");

const metadata = mobileMetadataJson as MobileMetadata;

const FEATURE_LABELS: Record<keyof IrrigationFeatures, string> = {
  Soil_Moisture: "Soil moisture",
  Temperature_C: "Temperature",
  Rainfall_mm: "Rainfall",
  Wind_Speed_kmh: "Wind speed",
  Crop_Growth_Stage: "Crop growth stage",
  Mulching_Used: "Mulching",
};

let sessionPromise: Promise<ort.InferenceSession> | null = null;

/**
 * Loads and caches the bundled ONNX model.
 */
const getIrrigationSession = async (): Promise<ort.InferenceSession> => {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const asset = Asset.fromModule(MODEL_ASSET);

      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error(
          "The irrigation ONNX model could not be resolved locally.",
        );
      }
      return ort.InferenceSession.create(asset.localUri, {
        executionMode: "sequential",
        graphOptimizationLevel: "all",
        enableCpuMemArena: true,
        enableMemPattern: true,
      });
    })();
  }

  return sessionPromise;
};

/**
 * Validates the raw values entered by the user.
 */
const validateFeatures = (features: IrrigationFeatures): void => {
  const numericFields: Array<keyof IrrigationFeatures> = [
    "Soil_Moisture",
    "Temperature_C",
    "Rainfall_mm",
    "Wind_Speed_kmh",
  ];

  for (const feature of numericFields) {
    const value = features[feature];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`${FEATURE_LABELS[feature]} must be a valid number.`);
    }
  }

  if (features.Soil_Moisture < 0) {
    throw new Error("Soil moisture cannot be negative.");
  }

  if (features.Rainfall_mm < 0) {
    throw new Error("Rainfall cannot be negative.");
  }

  if (features.Wind_Speed_kmh < 0) {
    throw new Error("Wind speed cannot be negative.");
  }

  validateCategory("Crop_Growth_Stage", features.Crop_Growth_Stage);

  validateCategory("Mulching_Used", features.Mulching_Used);
};

const validateCategory = (feature: string, value: string): void => {
  const acceptedValues = metadata.categorical_levels[feature];

  if (!acceptedValues?.includes(value)) {
    throw new Error(
      `Invalid ${feature}: "${value}". Expected one of: ${
        acceptedValues?.join(", ") ?? "no configured values"
      }.`,
    );
  }
};

/**
 * Reproduces the fitted sklearn ColumnTransformer.
 *
 * Numerical features:
 *     z = (x - training mean) / training standard deviation
 *
 * Categorical features:
 *     one-hot encoding using the fitted category order
 */
const preprocessFeatures = (features: IrrigationFeatures): Float32Array => {
  const transformed: number[] = [];
  const featureRecord = features as unknown as Record<string, number | string>;

  for (const feature of metadata.numeric_features) {
    let value = Number(featureRecord[feature]);

    if (!Number.isFinite(value)) {
      value = metadata.numeric_imputer[feature];
    }

    const mean = metadata.numeric_scaler_mean[feature];
    const scale = metadata.numeric_scaler_scale[feature];

    if (!Number.isFinite(mean) || !Number.isFinite(scale)) {
      throw new Error(`Missing scaling metadata for ${feature}.`);
    }

    transformed.push(scale === 0 ? 0 : (value - mean) / scale);
  }

  for (const feature of metadata.categorical_features) {
    let value = featureRecord[feature];

    if (value === undefined || value === null || String(value).trim() === "") {
      value = metadata.categorical_imputer[feature];
    }

    const stringValue = String(value);
    const categories = metadata.categorical_levels[feature];

    for (const category of categories) {
      transformed.push(stringValue === category ? 1 : 0);
    }
  }

  if (transformed.length !== metadata.input_dimension) {
    throw new Error(
      `Expected ${metadata.input_dimension} transformed values, ` +
        `but received ${transformed.length}.`,
    );
  }

  return Float32Array.from(transformed);
};

/**
 * Creates the neutral reference used for feature occlusion.
 *
 * Numerical baselines become zero after standardisation because
 * zero represents the training mean.
 *
 * Categorical baselines use the most-frequent training category
 * stored by the fitted imputer.
 */
const createBaselineVector = (): Float32Array => {
  const baseline: number[] = [];

  for (const feature of metadata.numeric_features) {
    baseline.push(0);
  }

  for (const feature of metadata.categorical_features) {
    const baselineCategory = metadata.categorical_imputer[feature];

    for (const category of metadata.categorical_levels[feature]) {
      baseline.push(category === baselineCategory ? 1 : 0);
    }
  }

  if (baseline.length !== metadata.input_dimension) {
    throw new Error("The explanation baseline has the wrong input dimension.");
  }

  return Float32Array.from(baseline);
};

/**
 * Runs one ONNX inference and returns the output logits.
 */
const runModel = async (
  session: ort.InferenceSession,
  transformedFeatures: Float32Array,
): Promise<number[]> => {
  const inputName = metadata.onnx_input_name ?? session.inputNames[0];

  const outputName = metadata.onnx_output_name ?? session.outputNames[0];

  const inputTensor = new ort.Tensor("float32", transformedFeatures, [
    1,
    metadata.input_dimension,
  ]);

  const outputs = await session.run({
    [inputName]: inputTensor,
  });

  const outputTensor = outputs[outputName];

  if (!outputTensor) {
    throw new Error(`The ONNX model did not return "${outputName}".`);
  }

  const logits = Array.from(outputTensor.data as Float32Array);

  if (logits.length !== metadata.class_names_by_output_index.length) {
    throw new Error(
      "The number of ONNX outputs does not match the class metadata.",
    );
  }

  return logits;
};

/**
 * Converts logits to probabilities using a numerically stable softmax.
 */
const softmax = (logits: number[]): number[] => {
  const maximumLogit = Math.max(...logits);

  const exponentials = logits.map((logit) => Math.exp(logit - maximumLogit));

  const total = exponentials.reduce((sum, value) => sum + value, 0);

  return exponentials.map((value) => value / total);
};

const indexOfMaximum = (values: number[]): number => {
  return values.reduce(
    (bestIndex, value, index, array) =>
      value > array[bestIndex] ? index : bestIndex,
    0,
  );
};

/**
 * Replaces one raw feature group with its neutral baseline.
 *
 * A categorical raw feature may occupy several one-hot columns,
 * so every column belonging to the raw feature is replaced.
 */
const occludeFeature = (
  input: Float32Array,
  baseline: Float32Array,
  feature: keyof IrrigationFeatures,
): Float32Array => {
  const occluded = new Float32Array(input);

  metadata.raw_feature_group_for_transformed_input.forEach(
    (rawFeature, transformedIndex) => {
      if (rawFeature === feature) {
        occluded[transformedIndex] = baseline[transformedIndex];
      }
    },
  );

  return occluded;
};

const explanationDirection = (
  impact: number,
): FeatureExplanation["direction"] => {
  const threshold = 0.005;

  if (impact > threshold) {
    return "supports";
  }

  if (impact < -threshold) {
    return "opposes";
  }

  return "little influence";
};

const createExplanationText = (
  feature: keyof IrrigationFeatures,
  predictedClass: string,
  impact: number,
): string => {
  const label = FEATURE_LABELS[feature];
  const percentagePoints = Math.abs(impact * 100).toFixed(1);
  const direction = explanationDirection(impact);

  if (direction === "supports") {
    return (
      `${label} supported the ${predictedClass} prediction ` +
      `by approximately ${percentagePoints} percentage points ` +
      "relative to its baseline."
    );
  }

  if (direction === "opposes") {
    return (
      `${label} opposed the ${predictedClass} prediction ` +
      `by approximately ${percentagePoints} percentage points ` +
      "relative to its baseline."
    );
  }

  return (
    `${label} had little influence on the ` + `${predictedClass} prediction.`
  );
};

/**
 * Predicts irrigation need and calculates local feature explanations.
 *
 * Explanation method:
 * 1. Run the complete input.
 * 2. Replace one raw feature with its baseline.
 * 3. Run the model again.
 * 4. Measure the change in predicted-class probability.
 */
export async function predictIrrigationNeed(
  features: IrrigationFeatures,
): Promise<IrrigationPrediction> {
  validateFeatures(features);

  const session = await getIrrigationSession();
  const transformedFeatures = preprocessFeatures(features);

  const logits = await runModel(session, transformedFeatures);

  const probabilityValues = softmax(logits);
  const predictedIndex = indexOfMaximum(probabilityValues);

  const predictedClass = metadata.class_names_by_output_index[predictedIndex];

  const confidence = probabilityValues[predictedIndex];

  const probabilities: Record<string, number> = {};

  metadata.class_names_by_output_index.forEach((className, index) => {
    probabilities[className] = probabilityValues[index];
  });

  const baseline = createBaselineVector();

  const rawFeatures = metadata.raw_feature_order as Array<
    keyof IrrigationFeatures
  >;

  const explanationResults: Array<
    Omit<FeatureExplanation, "relativeImportance">
  > = [];

  // Sequential execution is safer for a shared native session.
  for (const feature of rawFeatures) {
    const occludedInput = occludeFeature(
      transformedFeatures,
      baseline,
      feature,
    );

    const occludedLogits = await runModel(session, occludedInput);

    const occludedProbabilities = softmax(occludedLogits);

    const occludedConfidence = occludedProbabilities[predictedIndex];

    const impact = confidence - occludedConfidence;

    explanationResults.push({
      feature,
      value: features[feature],
      impact,
      impactPercentagePoints: impact * 100,
      direction: explanationDirection(impact),
      explanation: createExplanationText(feature, predictedClass, impact),
    });
  }

  const totalAbsoluteImpact = explanationResults.reduce(
    (sum, item) => sum + Math.abs(item.impact),
    0,
  );

  const explanations: FeatureExplanation[] = explanationResults
    .map((item) => ({
      ...item,
      relativeImportance:
        totalAbsoluteImpact === 0
          ? 0
          : Math.abs(item.impact) / totalAbsoluteImpact,
    }))
    .sort((first, second) => Math.abs(second.impact) - Math.abs(first.impact));

  return {
    predictedClass,
    predictedIndex,
    confidence,
    probabilities,
    explanations,
  };
}
