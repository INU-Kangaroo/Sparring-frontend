import { get, post } from "./index";

export type StepSource = "APPLE_HEALTH" | "GOOGLE_FIT" | "MANUAL" | string;

export type StepSyncRequest = {
  stepDate: string;
  steps: number;
  source: StepSource;
};

export type StepSyncResponse = {
  stepDate: string;
  steps: number;
  source: StepSource;
  syncedAt?: string;
};

export type TodayStepsResponse = {
  date?: string;
  stepDate?: string;
  steps?: number;
  totalSteps?: number;
  updatedAt?: string;
};

export type StepsRecord = {
  date?: string;
  stepDate?: string;
  steps?: number;
  totalSteps?: number;
};

type StepRecordParams = {
  period: "daily" | "weekly" | "monthly" | "range";
  date?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

function unwrap<T = any>(resData: any): T {
  if (resData == null) return resData as T;
  if (typeof resData === "object" && "data" in resData) {
    return resData.data as T;
  }
  return resData as T;
}

function normalizeTodaySteps(data?: TodayStepsResponse | null): TodayStepsResponse {
  const totalSteps = data?.totalSteps ?? data?.steps ?? 0;
  return {
    date: data?.date ?? data?.stepDate ?? "",
    stepDate: data?.stepDate ?? data?.date ?? "",
    steps: data?.steps ?? totalSteps,
    totalSteps,
    updatedAt: data?.updatedAt,
  };
}

function normalizeStepRecord(record: StepsRecord): StepsRecord {
  const totalSteps = record?.totalSteps ?? record?.steps ?? 0;
  return {
    date: record?.date ?? record?.stepDate ?? "",
    stepDate: record?.stepDate ?? record?.date ?? "",
    steps: record?.steps ?? totalSteps,
    totalSteps,
  };
}

async function getStepRecords(params: StepRecordParams): Promise<StepsRecord[]> {
  try {
    const res = await get("/api/records/steps", { params });
    const data = unwrap<StepsRecord[] | any>(res.data ?? res);
    return Array.isArray(data) ? data.map(normalizeStepRecord) : [];
  } catch {
    return [];
  }
}

export async function syncSteps(payload?: StepSyncRequest) {
  try {
    const res = payload
      ? await post("/api/records/steps/sync", payload)
      : await post("/api/records/steps/sync");
    return unwrap<StepSyncResponse | any>(res.data ?? res);
  } catch (e) {
    console.error("steps sync error", e);
    return null;
  }
}

export async function getTodaySteps(): Promise<TodayStepsResponse> {
  try {
    const res = await get("/api/records/steps/today");
    return normalizeTodaySteps(unwrap<TodayStepsResponse>(res.data ?? res));
  } catch {
    return normalizeTodaySteps(null);
  }
}

export async function getSteps(
  startDate: string,
  endDate: string
): Promise<StepsRecord[]> {
  return getStepRecords({ period: "range", startDate, endDate });
}

export async function getDailySteps(date: string) {
  return getStepRecords({ period: "daily", date });
}

export async function getWeeklySteps(date?: string) {
  return getStepRecords({ period: "weekly", ...(date ? { date } : {}) });
}

export async function getMonthlySteps(year: number, month?: number) {
  return getStepRecords({ period: "monthly", year, ...(month ? { month } : {}) });
}

export async function getStepLogs(startDate: string, endDate: string) {
  return getStepRecords({ period: "range", startDate, endDate });
}