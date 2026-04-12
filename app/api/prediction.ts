import { post } from "./index";

export type BloodSugarPredictionRequest = {
  meal: {
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    kcal: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
  };
};

export type BloodSugarForecastPoint = {
  minute?: number;
  glucose?: number;
  time?: string;
  offsetMinutes?: number;
  step?: number;
  predictedGlucose?: number;
};

export type BloodSugarPredictionPeak = {
  peakGlucose: number;
  peakTime: string;
  peakOffsetMinutes: number;
};

export type BloodSugarPredictionResponse = {
  foodName?: string;
  predictedGlucose?: number;
  predictionOffsetMinutes?: number;
  predictedTime?: string;
  forecast?: BloodSugarForecastPoint[];
  curve?: BloodSugarForecastPoint[];
  milestones?: Record<string, BloodSugarForecastPoint>;
  peak?: BloodSugarPredictionPeak;
  peakGlucose?: number;
  peakOffsetMinutes?: number;
  peakMinute?: number;
};

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

export async function predictBloodSugar(payload: BloodSugarPredictionRequest) {
  const res = await post("/api/predictions/blood-sugar", payload);
  return unwrap<BloodSugarPredictionResponse>(res);
}
