import { get, post } from "./index";

export async function createBloodSugarLog(payload: any) {
  const res = await post("/api/measurements/blood-sugar/logs", payload);
  return res.data?.data ?? res.data;
}

export async function getBloodSugarLogs(startDate: string, endDate: string) {
  const res = await get("/api/measurements/blood-sugar/logs", {
    params: { startDate, endDate },
  });
  return res.data?.data ?? res.data;
}

export async function getBloodSugarMonthlyStats(year: number) {
  const res = await get("/api/measurements/blood-sugar/logs/monthly-stats", {
    params: { year },
  });
  return res.data?.data ?? res.data;
}

export async function getBloodSugarMonthly(year: number, month: number) {
  const res = await get("/api/measurements/blood-sugar/logs/monthly", {
    params: { year, month },
  });
  return res.data?.data ?? res.data;
}

export async function getBloodSugarDaily(date: string) {
  const res = await get("/api/measurements/blood-sugar/logs/daily", {
    params: { date },
  });
  return res.data?.data ?? res.data;
}