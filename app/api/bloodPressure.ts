import { get, post } from "./index";

export type BloodPressureCreateRequest = {
  systolic: number;
  diastolic: number;
  heartRate?: number;
  measurementDate: string;   // "2026-01-28"
  measurementTime: string;   // "08:00"
  measurementLabel: string;  // "아침" | "취침 전"
};

export type BloodPressureLog = {
  systolic: number;
  diastolic: number;
  heartRate?: number;
  measuredAt: string;        // "2026-01-28T08:00:00"
  measurementLabel: string;
};

export type RecordPeriod = "daily" | "weekly" | "monthly" | "range";

export type BloodPressureQueryParams = {
  period: RecordPeriod;
  date?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
};

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

export async function createBloodPressureLog(payload: BloodPressureCreateRequest) {
  const res = await post("/api/records/blood-pressure", payload);
  return unwrap<BloodPressureLog>(res);
}

export async function getBloodPressureRecords(params: BloodPressureQueryParams) {
  const res = await get("/api/records/blood-pressure", {
    params,
  });
  return unwrap<any>(res);
}

export async function getBloodPressureDaily(date?: string) {
  return getBloodPressureRecords({
    period: "daily",
    ...(date ? { date } : {}),
  });
}

export async function getBloodPressureWeekly(date?: string) {
  return getBloodPressureRecords({
    period: "weekly",
    ...(date ? { date } : {}),
  });
}

export async function getBloodPressureMonthly(year: number, month: number) {
  return getBloodPressureRecords({
    period: "monthly",
    year,
    month,
  });
}

export async function getBloodPressureLogs(startDate: string, endDate: string) {
  return getBloodPressureRecords({
    period: "range",
    startDate,
    endDate,
  });
}