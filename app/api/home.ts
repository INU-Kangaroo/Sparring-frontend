// app/api/home.ts
import { get } from "./index";

export type Period = "week" | "month" | "all";

// ✅ 백엔드가 { data: {...} }로 감싸서 줄 수도 있고 그냥 줄 수도 있으니 정규화
function unwrap<T = any>(resData: any): T {
  if (resData == null) return resData as T;
  if (typeof resData === "object" && "data" in resData) return (resData as any).data as T;
  return resData as T;
}

/** A) 오늘의 한마디 */
export type TodayInsightResponse = {
  title?: string;
  content?: string;
  message?: string;
  [key: string]: any;
};

export async function getTodayInsight(): Promise<TodayInsightResponse> {
  const res = await get("/api/home/today-insight");
  return unwrap<TodayInsightResponse>(res.data);
}

/** C) 빠른 통계 */
export type QuickStatsResponse = {
  todayText?: string;
  weekText?: string;
  avgText?: string;

  todayGlucoseCount?: number;
  todayBpCount?: number;
  weekGlucoseCount?: number;
  weekBpCount?: number;
  weekGlucoseAvg?: number;

  [key: string]: any;
};

export async function getQuickStats(): Promise<QuickStatsResponse> {
  const res = await get("/api/home/quick-stats");
  return unwrap<QuickStatsResponse>(res.data);
}

/** B) 차트 */
export type HomeChartResponse = {
  labels?: string[];
  glucose?: number[];
  systolic?: number[];
  diastolic?: number[];
  emojis?: string[];
  [key: string]: any;
};

const HOME_CHART_ENDPOINT = "/api/home/chart"; // 너희 실제 경로

export async function getHomeChart(period: Period): Promise<HomeChartResponse> {
  const res = await get(HOME_CHART_ENDPOINT, { params: { period } });
  return unwrap<HomeChartResponse>(res.data);
}