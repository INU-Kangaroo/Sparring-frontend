import { get, post } from "./index";

function unwrap<T = any>(resData: any): T {
  if (resData == null) return resData as T;
  if (typeof resData === "object" && "data" in resData) {
    return resData.data as T;
  }
  return resData as T;
}

/** 오늘 걸음수 */
export type TodayStepsResponse = {
  date: string;
  steps: number;
};

/** 기간별 걸음수 */
export type StepsRecord = {
  date: string;
  steps: number;
};

/** 1️⃣ 걸음수 동기화 */
export async function syncSteps() {
  try {
    const res = await post("/api/records/steps/sync");
    return unwrap(res.data);
  } catch (e) {
    console.error("steps sync error", e);
    return null;
  }
}

/** 2️⃣ 오늘 걸음수 조회 */
export async function getTodaySteps(): Promise<TodayStepsResponse> {
  try {
    const res = await get("/api/records/steps/today");
    const data = unwrap<TodayStepsResponse>(res.data);

    if (data?.steps != null) return data;
  } catch {}

  return {
    date: "",
    steps: 0,
  };
}

/** 3️⃣ 기간별 조회 */
export async function getSteps(
  startDate: string,
  endDate: string
): Promise<StepsRecord[]> {
  try {
    const res = await get("/api/records/steps", {
      params: { startDate, endDate },
    });

    return unwrap<StepsRecord[]>(res.data) ?? [];
  } catch {
    return [];
  }
}