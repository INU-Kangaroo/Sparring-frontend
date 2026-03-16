import { get, post } from "./index";

export type BloodPressureCreateRequest = {
  systolic: number;
  diastolic: number;
  heartRate?: number;        // optional
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

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

export async function createBloodPressureLog(payload: BloodPressureCreateRequest) {
  const res = await post("/api/measurements/blood-pressure/logs", payload);
  return unwrap<BloodPressureLog>(res);
}

export async function getBloodPressureDaily(date: string) {
  const res = await get("/api/measurements/blood-pressure/logs/daily", {
    params: { date },
  });
  return unwrap<BloodPressureLog[] | any>(res);
}

export async function getBloodPressureLogs(startDate: string, endDate: string) {
  const res = await get("/api/measurements/blood-pressure/logs", {
    params: { startDate, endDate },
  });
  return unwrap<BloodPressureLog[] | any>(res);
}

export async function getBloodPressureMonthlyStats(year: number) {
  const res = await get("/api/measurements/blood-pressure/logs/monthly-stats", {
    params: { year },
  });
  return unwrap<any>(res);
}

export async function getBloodPressureMonthly(year: number, month: number) {
  const res = await get("/api/measurements/blood-pressure/logs/monthly", {
    params: { year, month },
  });
  return unwrap<any>(res);
}