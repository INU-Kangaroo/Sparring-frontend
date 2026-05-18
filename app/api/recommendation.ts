import { post } from "./index";

// ── 타입 ──────────────────────────────────────────────────

export type ExerciseRequest = {
  duration: "SHORT" | "MEDIUM" | "LONG";
  intensity: "LOW" | "MODERATE" | "HIGH";
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

export type FoodRecommendationRequest = {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
};

export type FoodMenuItem = {
  id?: number | string;
  name?: string;
  kcal?: number;
  carbs?: number | string;
  protein?: number | string;
  fat?: number | string;
  sodium?: number | string;
};

export type FoodRecommendationItem = {
  recommendationCardId?: number | string;
  rank?: number;
  title?: string;
  nutrients?: {
    kcal?: number;
    carbs?: number | string;
    sugar?: number | string;
    fiber?: number | string;
    protein?: number | string;
    fat?: number | string;
    saturatedFat?: number | string;
    transFat?: number | string;
    cholesterol?: number | string;
    sodium?: number | string;
  };
  menus?: FoodMenuItem[];
  foodId?: string | number;
  foodName?: string;
  foodOrigin?: string;
  categoryLarge?: string;
  categoryMedium?: string;
  glucoseFriendlyScore?: number;
  score?: number;
  reactionGrade?: string;
  responseLevel?: string;
  reasonTags?: string[];
  refIntakeAmount?: string;
  foodWeight?: string;
  calories?: number;
  carbs?: number | string;
  sugar?: number | string;
  fiber?: number | string;
  protein?: number | string;
  fat?: number | string;
  saturatedFat?: number | string;
  transFat?: number | string;
  cholesterol?: number | string;
  sodium?: number | string;
  reasons?: string[];
};

export type FoodRecommendationResponse = {
  recommendationId?: number | string;
  mealType?: string;
  mealTime?: string;
  foods?: FoodRecommendationItem[];
  recommendations?: FoodRecommendationItem[];
  items?: FoodRecommendationItem[];
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

export async function fetchFoodRecommendation(
  body: FoodRecommendationRequest
): Promise<FoodRecommendationResponse> {

  const res = await post<FoodRecommendationResponse>(
    `/api/recommendations/food?mealType=${body.mealType}`
  );

  return unwrap<FoodRecommendationResponse>(res.data);
}
export async function refreshFoodRecommendation(
  body: FoodRecommendationRequest
): Promise<FoodRecommendationResponse> {

  const res = await post<FoodRecommendationResponse>(
    `/api/recommendations/food/refresh?mealType=${body.mealType}`
  );

  return unwrap<FoodRecommendationResponse>(res.data);
}