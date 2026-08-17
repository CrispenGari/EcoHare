import { THistory } from "../store/historyStore";

export type TCropGrowthStage =
  | "Flowering"
  | "Harvest"
  | "Sowing"
  | "Vegetative";

export type TMulchingUsed = "Yes" | "No";
export type TIrrigationClass = "Low" | "Medium" | "High";

export type TFormState = {
  soilMoisture: string;
  temperature: string;
  rainfall: string;
  windSpeed: string;
  cropGrowthStage: TCropGrowthStage;
  mulchingUsed: TMulchingUsed;
  loading: boolean;
  error: string;
};

export const GROWTH_STAGES: TCropGrowthStage[] = [
  "Sowing",
  "Vegetative",
  "Flowering",
  "Harvest",
];

export const MULCHING_OPTIONS: TMulchingUsed[] = ["Yes", "No"];

export type TIrrigationFeatures = {
  Soil_Moisture: number;
  Temperature_C: number;
  Rainfall_mm: number;
  Wind_Speed_kmh: number;
  Crop_Growth_Stage: TCropGrowthStage;
  Mulching_Used: TMulchingUsed;
};

export type TMobileMetadata = {
  numeric_features: string[];
  categorical_features: string[];

  numeric_imputer: Record<string, number>;
  numeric_scaler_mean: Record<string, number>;
  numeric_scaler_scale: Record<string, number>;

  categorical_imputer: Record<string, string>;
  categorical_levels: Record<string, string[]>;

  transformed_feature_order: string[];
  raw_feature_group_for_transformed_input: string[];

  input_dimension: number;
  class_names_by_output_index: string[];

  onnx_input_name: string;
  onnx_output_name: string;
};

export type TFeatureExplanation = {
  feature: keyof TIrrigationFeatures;
  value: number | string;
  impact: number;
  impactPercentagePoints: number;
  relativeImportance: number;
  direction: "supports" | "opposes" | "little influence";
  explanation: string;
};

export type TIrrigationPrediction = {
  predictedClass: string;
  predictedIndex: number;
  confidence: number;
  probabilities: Record<string, number>;
  explanations: TFeatureExplanation[];
};

export type TRecentPredictionsProps = {
  history: THistory[];
  limit?: number | null;
  showSeeAll?: boolean;
  onPressPrediction: (item: THistory) => void | Promise<void>;
  onSeeAll?: () => void | Promise<void>;
  onStartPrediction?: () => void | Promise<void>;
  onOpenHelp?: () => void | Promise<void>;
};
