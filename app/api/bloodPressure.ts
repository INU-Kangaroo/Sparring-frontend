import { get, post } from "./index";

export async function createBloodPressureLog(payload: {
  systolic: number;
  diastolic: number;
  measuredAt: string;
  measurementLabel: string; // "아침" | "취침 전"
  heartRate?: number;
}) {
  const res = await post("/api/measurements/blood-pressure/logs", payload);
  return res.data?.data ?? res.data;
}

export async function getBloodPressureDaily(date: string) {
  const res = await get("/api/measurements/blood-pressure/logs/daily", {
    params: { date },
  });
  return res.data?.data ?? res.data;
}

export async function getBloodPressureLogs(startDate: string, endDate: string) {
  const res = await get("/api/measurements/blood-pressure/logs", {
    params: { startDate, endDate },
  });
  return res.data?.data ?? res.data;
}

export async function getBloodPressureMonthlyStats(year: number) {
  const res = await get("/api/measurements/blood-pressure/logs/monthly-stats", {
    params: { year },
  });
  return res.data?.data ?? res.data;
}

export async function getBloodPressureMonthly(year: number, month: number) {
  const res = await get("/api/measurements/blood-pressure/logs/monthly", {
    params: { year, month },
  });
  return res.data?.data ?? res.data;
}