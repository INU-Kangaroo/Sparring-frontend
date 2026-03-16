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

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

export async function createBloodSugarLog(payload: BloodSugarCreateRequest) {
  const res = await post("/api/measurements/blood-sugar/logs", payload);
  return unwrap<BloodSugarLog>(res);
}

export async function getBloodSugarDaily(date: string) {
  const res = await get("/api/measurements/blood-sugar/logs/daily", {
    params: { date },
  });
  return unwrap<BloodSugarLog[] | any>(res);
}

export async function getBloodSugarLogs(startDate: string, endDate: string) {
  const res = await get("/api/measurements/blood-sugar/logs", {
    params: { startDate, endDate },
  });
  return unwrap<any>(res);
}

export async function getBloodSugarMonthlyStats(year: number) {
  const res = await get("/api/measurements/blood-sugar/logs/monthly-stats", {
    params: { year },
  });
  return unwrap<any>(res);
}

export async function getBloodSugarMonthly(year: number, month: number) {
  const res = await get("/api/measurements/blood-sugar/logs/monthly", {
    params: { year, month },
  });
  return unwrap<any>(res);
}