import { get } from "./index";

// ── 타입 정의 ──────────────────────────────────────────────────────

/** 오늘의 인사이트 */
export type TodayInsightResponse = {
  type?: string;
  message?: string;
  [key: string]: any;
};

/** 점수 데이터 */
export type ScoresData = {
  healthManagement: number;
  measurementConsistency: number;
  lifestyle: number;
};

/** 일일 상태 */
export type DailyCondition = {
  dayOfWeek: string;
  status: "GOOD" | "CAUTION" | "BAD" | "NO_DATA";
};

/** 하이라이트 */
export type Highlight = {
  type: "GOOD" | "WARNING";
  message: string;
};

/** 개선 사항 */
export type Improvement = {
  category: "BLOOD_SUGAR" | "BLOOD_PRESSURE" | "MEAL" | "EXERCISE";
  timeLabel: string;
  detail: string;
  tips: string[];
};

/** 이번주/특정 주간 보고서 상세 */
export type WeeklyReportResponse = {
  type: "BOTH_STABLE" | "BOTH_CAUTION" | "BOTH_BAD" | "MIXED";
  message: string;
  reportId: number;
  startDate: string;
  endDate: string;
  recordDays: number;
  bloodSugarRecordDays: number;
  bloodPressureRecordDays: number;
  aiComment: string;
  overallScore: number;
  scoreLabel: string;
  scores: ScoresData;
  dailyConditions: DailyCondition[];
  highlights: Highlight[];
  improvement: Improvement;
};

/** 주간 보고서 목록 아이템 */
export type WeeklyReportItem = {
  reportId: number;
  weekLabel: string;
  startDate: string;
  endDate: string;
  overallScore: number;
  bloodSugarRecordDays: number;
  bloodPressureRecordDays: number;
};

/** 주간 보고서 목록 응답 */
export type WeeklyReportHistoryResponse = {
  items: WeeklyReportItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

// ── 유틸 함수 ──────────────────────────────────────────────────────

function unwrap<T = any>(resData: any): T {
  if (resData == null) return resData as T;
  if (typeof resData === "object" && "data" in resData) {
    return (resData as any).data as T;
  }
  return resData as T;
}

// ── API 함수 ──────────────────────────────────────────────────────

/**
 * 오늘의 인사이트 조회
 */
export async function getTodayInsight(): Promise<TodayInsightResponse> {
  try {
    const res = await get<TodayInsightResponse>("/api/insights/today");
    const data = unwrap<TodayInsightResponse>(res.data);
    return data || {};
  } catch (error) {
    console.error("[API] getTodayInsight error:", error);
    return {
      message: "오늘의 인사이트를 불러오지 못했어요.",
    };
  }
}

/**
 * 이번주 주간 보고서 조회
 */
export async function getWeeklyReport(): Promise<WeeklyReportResponse> {
  try {
    const res = await get<WeeklyReportResponse>("/api/insights/weekly");
    const data = unwrap<WeeklyReportResponse>(res.data);
    return data || {};
  } catch (error: any) {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    if (status === 400 && code === "RP003") {
      console.warn("[API] getWeeklyReport no data to create report. returning empty.");
      return {
        type: "NO_DATA",
        message: "보고서 생성을 위한 데이터가 부족합니다.",
        reportId: 0,
        startDate: "",
        endDate: "",
        recordDays: 0,
        bloodSugarRecordDays: 0,
        bloodPressureRecordDays: 0,
        aiComment: "기록을 추가하면 주간 보고서를 볼 수 있어요.",
        overallScore: 0,
        scoreLabel: "",
        scores: { healthManagement: 0, measurementConsistency: 0, lifestyle: 0 },
        dailyConditions: [],
        highlights: [],
        improvement: { category: "BLOOD_SUGAR", timeLabel: "", detail: "", tips: [] },
      };
    }
    console.error("[API] getWeeklyReport error:", error);
    throw error;
  }
}

/**
 * 지난 주간 보고서 목록 조회
 * @param year - 연도 (선택, 없으면 null 처리)
 * @param month - 월 (선택, 없으면 null 처리)
 * @param page - 페이지 (기본값 0)
 * @param size - 페이지 크기 (기본값 20)
 */
export async function getWeeklyReportHistory(
  params?: {
    year?: number;
    month?: number;
    page?: number;
    size?: number;
  }
): Promise<WeeklyReportHistoryResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.year !== undefined && params.year !== null) {
      queryParams.append("year", String(params.year));
    }
    if (params?.month !== undefined && params.month !== null) {
      queryParams.append("month", String(params.month));
    }
    queryParams.append("page", String(params?.page ?? 0));
    queryParams.append("size", String(params?.size ?? 20));

    const queryString = queryParams.toString();
    const url = `/api/insights/weekly/history${queryString ? `?${queryString}` : ""}`;

    const res = await get<WeeklyReportHistoryResponse>(url);
    const data = unwrap<WeeklyReportHistoryResponse>(res.data);
    return data || {};
  } catch (error) {
    console.error("[API] getWeeklyReportHistory error:", error);
    throw error;
  }
}

/**
 * 특정 주간 보고서 상세 조회
 * @param reportId - 보고서 ID
 */
export async function getWeeklyReportDetail(
  reportId: number
): Promise<WeeklyReportResponse> {
  try {
    const res = await get<WeeklyReportResponse>(
      `/api/insights/weekly/${reportId}`
    );
    const data = unwrap<WeeklyReportResponse>(res.data);
    return data || {};
  } catch (error) {
    console.error("[API] getWeeklyReportDetail error:", error);
    throw error;
  }
}