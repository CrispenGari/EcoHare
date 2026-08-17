import * as Haptics from "expo-haptics";
import { Alert } from "react-native";
import * as StoreReview from "expo-store-review";
import * as Updates from "expo-updates";
import * as Constants from "expo-constants";
import { TIrrigationClass } from "../types";
import { FEATURE_DETAILS } from "../constants";

export const onImpact = async () =>
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
export const rateApp = async () => {
  const available = await StoreReview.isAvailableAsync();
  if (available) {
    const hasAction = await StoreReview.hasAction();
    if (hasAction) {
      await StoreReview.requestReview();
    }
  }
};
export const onFetchUpdateAsync = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    Alert.alert(
      Constants.default.name,
      error as any,
      [{ text: "OK", style: "destructive" }],
      { cancelable: false },
    );
  }
};

export const getPredictionMessage = (predictedClass: TIrrigationClass) => {
  switch (predictedClass) {
    case "High":
      return "The model estimates a high irrigation requirement. Check current soil and weather conditions before applying water.";

    case "Medium":
      return "The model estimates a moderate irrigation requirement. Controlled irrigation may be appropriate depending on field conditions.";

    case "Low":
      return "The model estimates a low irrigation requirement. Unnecessary watering should be avoided unless the crop shows signs of water stress.";

    default:
      return "Use the prediction together with observations from the field.";
  }
};

export const formatProbability = (value: number) => {
  const percentage = value * 100;

  if (percentage < 0.1) {
    return `${percentage.toFixed(3)}%`;
  }

  return `${percentage.toFixed(2)}%`;
};

export const shortFeatureLabel = (feature: string) =>
  FEATURE_DETAILS[feature]?.shortLabel ?? feature.replaceAll("_", "\n");

export const humaniseFeature = (feature: string) =>
  FEATURE_DETAILS[feature]?.label ?? feature.replaceAll("_", " ");

export const formatFeatureValue = (feature: string, value: string | number) => {
  const unit = FEATURE_DETAILS[feature]?.unit ?? "";

  return typeof value === "number" ? `${value}${unit}` : String(value);
};

export const formatImpact = (value: number) => {
  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(2)} percentage points`;
};
