import { get, post } from "./index";

export type MealTime = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export type FoodSearchResult = {
  id: number;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  portionLabel?: string;
  portionAmount?: string;
  manufacturer?: string;
};

export type FoodDetail = {
  id: number;
  name: string;
  servingSize: number;
  servingUnit: string;
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
  sugar: number;
  cholesterol: number;
  saturatedFat: number;
  calories: number;
  portionLabel?: string;
  portionAmount?: string;
  manufacturer?: string;
};

export type FoodLogCreateRequest = {
  foodId: number;
  mealTime: MealTime | string;
  loggedAt: string; // ISO 8601
  eatenAmountGram: number;
};

export type FoodLog = {
  id: number;
  foodId?: number;
  foodName: string;
  mealTime: MealTime | string;
  eatenAt: string;
  eatenAmountGram: number;
  calories: number;
};

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

export async function searchFoods(
  keyword: string,
  page = 0,
  limit = 20
) {
  const res = await get("/api/foods/search", {
    params: { keyword, page, limit },
  });
  return unwrap<FoodSearchResult[]>(res);
}

export async function getFoodDetail(foodId: number) {
  const res = await get(`/api/foods/${foodId}`);
  return unwrap<FoodDetail>(res);
}

export async function createFoodLog(payload: FoodLogCreateRequest) {
  const res = await post("/api/foods/logs", payload);
  return unwrap<FoodLog>(res);
}

export async function getFoodLogsDaily(date: string) {
  const res = await get("/api/foods/logs/daily", {
    params: { date },
  });
  return unwrap<FoodLog[]>(res);
}
