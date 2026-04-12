import { get, post } from "./index";

export type MealTime = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export type FoodSearchResult = {
  id: number;
  name: string;
  foodOrigin?: string;
  categoryLarge?: string;
  categoryMedium?: string;
  refIntakeAmount?: string;
  foodWeight?: string;
  calories: number;
  manufacturer?: string;
  servingSize?: number;
  servingUnit?: string;
  portionLabel?: string;
  portionAmount?: string;
};

export type FoodDetail = {
  id: number;
  name: string;
  foodOrigin?: string;
  categoryLarge?: string;
  categoryMedium?: string;
  refIntakeAmount?: string;
  foodWeight?: string;
  manufacturer?: string;
  servingSize?: number;
  servingUnit?: string;
  carbs: number;
  sugar: number;
  fiber?: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  transFat?: number;
  cholesterol: number;
  sodium: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  calories: number;
  portionLabel?: string;
  portionAmount?: string;
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
  loggedAt?: string;
  eatenAt?: string;
  eatenAmountGram: number;
  calories: number;
};

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

type FoodRecordPeriod = "daily" | "weekly" | "monthly" | "range";

type FoodRecordParams = {
  period: FoodRecordPeriod;
  date?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

async function getFoodRecords(params: FoodRecordParams) {
  const res = await get("/api/records/food", { params });
  return unwrap<FoodLog[] | any>(res);
}

export async function searchFoods(
  keyword: string,
  page = 0,
  limit = 20
) {
  const normalizedPage = Math.max(0, Math.trunc(page));
  const normalizedLimit = Math.min(50, Math.max(1, Math.trunc(limit)));
  const res = await get("/api/catalog/foods/search", {
    params: { keyword, limit: normalizedLimit, page: normalizedPage },
  });
  return unwrap<FoodSearchResult[]>(res);
}

export async function getFoodDetail(foodId: number) {
  const res = await get(`/api/catalog/foods/${foodId}`);
  return unwrap<FoodDetail>(res);
}

export async function createFoodLog(payload: FoodLogCreateRequest) {
  const res = await post("/api/records/food", payload);
  return unwrap<FoodLog>(res);
}

export async function getFoodLogsDaily(date: string) {
  return getFoodRecords({ period: "daily", date });
}

export async function getFoodLogsWeekly(date?: string) {
  return getFoodRecords({ period: "weekly", ...(date ? { date } : {}) });
}

export async function getFoodLogsMonthly(year: number, month?: number) {
  return getFoodRecords({ period: "monthly", year, ...(month ? { month } : {}) });
}

export async function getFoodLogs(startDate: string, endDate: string) {
  return getFoodRecords({ period: "range", startDate, endDate });
}
