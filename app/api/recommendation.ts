import { post } from "./index";

// ── 타입 ──────────────────────────────────────────────────

export type ExerciseRequest = {
  duration: "SHORT" | "MEDIUM" | "LONG";
  intensity: "LOW" | "MEDIUM" | "HIGH"; // 서버 API에서 middle intensity를 MEDIUM으로 기대할 가능성이 높음
  location: "INDOOR" | "OUTDOOR" | "GYM";
};

export type CardiacExercise = {
  name: string;
  duration: string;
  minCalories: number;
  maxCalories: number;
  precautions: string[];
};

export type StrengthExercise = {
  name: string;
  duration: string;
  frequency: string;
  precautions: string[];
};

export type ExerciseResponse = {
  cardiacExercises: CardiacExercise[];
  strengthExercises: StrengthExercise[];
};

export type Supplement = {
  name: string;
  dosage: string;
  frequency: string;
  benefit: string;
  precautions: string[];
};

export type SupplementResponse = {
  supplements: Supplement[];
};

function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

// ── API 함수 ──────────────────────────────────────────────

export async function fetchExerciseRecommendation(
  body: ExerciseRequest
): Promise<ExerciseResponse> {
  try {
    const res = await post<ExerciseResponse>(
      "/api/recommendations/exercise",
      body
    );
    return unwrap<ExerciseResponse>(res.data);
  } catch (error) {
    console.error("fetchExerciseRecommendation failed", { body, error });
    throw error;
  }
}

export async function refreshExerciseRecommendation(
  body: ExerciseRequest
): Promise<ExerciseResponse> {
  const res = await post<ExerciseResponse>(
    "/api/recommendations/exercise/refresh",
    body
  );
  return unwrap<ExerciseResponse>(res.data);
}

export async function fetchSupplementRecommendation(): Promise<SupplementResponse> {
  const res = await post<SupplementResponse>(
    "/api/recommendations/supplement"
  );
  return unwrap<SupplementResponse>(res.data);
}

export async function refreshSupplementRecommendation(): Promise<SupplementResponse> {
  const res = await post<SupplementResponse>(
    "/api/recommendations/supplement/refresh"
  );
  return unwrap<SupplementResponse>(res.data);
}
