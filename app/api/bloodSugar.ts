import { get, post } from "./index";

export type BloodSugarCreateRequest = {
  glucoseLevel: number;
  measurementDate: string;   // "2026-01-28"
  measurementTime: string;   // "08:00"
  measurementLabel: string;  // "공복" 등
};

export type BloodSugarLog = {
  glucoseLevel: number;
  measuredAt: string;        // "2026-01-28T08:00:00"
  measurementLabel: string;
};

export type RecordPeriod = "daily" | "weekly" | "monthly" | "range";

export type BloodSugarQueryParams = {
  period: RecordPeriod;
  date?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

export async function createBloodSugarLog(payload: BloodSugarCreateRequest) {
  const res = await post("/api/records/blood-sugar", payload);
  return unwrap<BloodSugarLog>(res);
}

export async function getBloodSugarRecords(params: BloodSugarQueryParams) {
  const res = await get("/api/records/blood-sugar", {
    params,
  });
  return unwrap<any>(res);
}

export async function getBloodSugarDaily(date?: string) {
  return getBloodSugarRecords({
    period: "daily",
    ...(date ? { date } : {}),
  });
}

export async function getBloodSugarWeekly(date?: string) {
  return getBloodSugarRecords({
    period: "weekly",
    ...(date ? { date } : {}),
  });
}

export async function getBloodSugarMonthly(year: number, month: number) {
  return getBloodSugarRecords({
    period: "monthly",
    year,
    month,
  });
}

export async function getBloodSugarLogs(startDate: string, endDate: string) {
  return getBloodSugarRecords({
    period: "range",
    startDate,
    endDate,
  });
}