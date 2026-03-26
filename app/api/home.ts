// app/api/home.ts
import { get } from "./index";
import { getBloodPressureLogs, type BloodPressureLog } from "./bloodPressure";
import { getBloodSugarLogs, type BloodSugarLog } from "./bloodSugar";

export type Period = "week" | "month" | "all";

function unwrap<T = any>(resData: any): T {
  if (resData == null) return resData as T;
  if (typeof resData === "object" && "data" in resData) return (resData as any).data as T;
  return resData as T;
}

/** A) 오늘의 인사이트 */
export type TodayInsightResponse = {
  type?: string;
  message?: string;
  [key: string]: any;
};

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

/** B) 차트 */
export type HomeChartResponse = {
  labels?: string[];
  glucose?: number[];
  systolic?: number[];
  diastolic?: number[];
  emojis?: string[];
  [key: string]: any;
};

const HOME_CHART_ENDPOINT = "/api/home/chart";

/* ---------------- utils ---------------- */

const pad2 = (n: number) => String(n).padStart(2, "0");

const toYmd = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const avg = (arr: number[]) =>
  arr.length ? Math.round(arr.reduce((sum, v) => sum + v, 0) / arr.length) : 0;

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfWeekMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekDates = (baseDate = new Date()) => {
  const monday = startOfWeekMonday(baseDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const getMonthWeekRanges = (baseDate = new Date()) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const ranges: { label: string; start: Date; end: Date }[] = [];

  let cursor = new Date(first);
  let week = 1;

  while (cursor <= last) {
    const start = startOfDay(cursor);

    const end = new Date(cursor);
    end.setDate(end.getDate() + 6);
    if (end > last) end.setTime(last.getTime());
    end.setHours(23, 59, 59, 999);

    ranges.push({
      label: `${week}주`,
      start,
      end,
    });

    cursor.setDate(cursor.getDate() + 7);
    week += 1;
  }

  return ranges;
};

const normalizeArray = <T = any>(raw: any): T[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const isSameYmd = (isoString: string, date: Date) => {
  if (!isoString) return false;
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return false;

  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
};

const inRange = (isoString: string, start: Date, end: Date) => {
  if (!isoString) return false;
  const t = new Date(isoString).getTime();
  if (Number.isNaN(t)) return false;
  return t >= start.getTime() && t <= end.getTime();
};

/* ---------------- typed value getters ---------------- */

// 혈당: 네가 준 타입 기준으로 확정
const getGlucoseValue = (item: BloodSugarLog) => Number(item.glucoseLevel ?? 0);
const getSugarMeasuredAt = (item: BloodSugarLog) => item.measuredAt;

// 혈압: 실제 타입이 다를 수 있으니 최대한 안전하게
const getSystolicValue = (item: BloodPressureLog | any) =>
  Number(item?.systolic ?? 0);

const getDiastolicValue = (item: BloodPressureLog | any) =>
  Number(item?.diastolic ?? 0);

const getBpMeasuredAt = (item: BloodPressureLog | any) =>
  item?.measuredAt ?? item?.measurementTime ?? item?.recordedAt ?? "";

const getEmojiFromGlucose = (value: number) => {
  if (!value) return "—";
  if (value <= 99) return "🙂";
  if (value <= 125) return "😅";
  return "⚠️";
};

async function fetchLogsForPeriod(period: Period) {
  const today = new Date();

  let startDate = "";
  let endDate = "";

  if (period === "week") {
    const weekDates = getWeekDates(today);
    startDate = toYmd(weekDates[0]);
    endDate = toYmd(weekDates[6]);
  } else if (period === "month") {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    startDate = toYmd(first);
    endDate = toYmd(last);
  } else {
    const first = new Date(today.getFullYear() - 1, 0, 1);
    startDate = toYmd(first);
    endDate = toYmd(today);
  }

  const [sugarLogsRaw, bpLogsRaw] = await Promise.all([
    getBloodSugarLogs(startDate, endDate),
    getBloodPressureLogs(startDate, endDate),
  ]);

  return {
    sugarLogs: normalizeArray<BloodSugarLog>(sugarLogsRaw),
    bpLogs: normalizeArray<BloodPressureLog>(bpLogsRaw),
  };
}

/* ---------------- A) 오늘의 인사이트 ---------------- */

export async function getTodayInsight(): Promise<TodayInsightResponse> {
  try {
    const res = await get("/api/insights/today");
    const data = unwrap<TodayInsightResponse>(res.data);
    if (data?.message) return data;
  } catch {}

  const today = new Date();
  const todayStr = toYmd(today);

  try {
    const [sugarRaw, bpRaw] = await Promise.all([
      getBloodSugarLogs(todayStr, todayStr),
      getBloodPressureLogs(todayStr, todayStr),
    ]);

    const sugarLogs = normalizeArray<BloodSugarLog>(sugarRaw);
    const bpLogs = normalizeArray<BloodPressureLog>(bpRaw);

    const glucoseAvg = avg(sugarLogs.map(getGlucoseValue).filter((v) => v > 0));
    const systolicAvg = avg(bpLogs.map(getSystolicValue).filter((v) => v > 0));
    const diastolicAvg = avg(bpLogs.map(getDiastolicValue).filter((v) => v > 0));

    if (!sugarLogs.length && !bpLogs.length) {
      return {
        message: "오늘 기록이 아직 없어요. 혈당이나 혈압을 입력해보세요.",
      };
    }

    if (sugarLogs.length && glucoseAvg <= 120) {
      return {
        message: `오늘 혈당 평균이 ${glucoseAvg}mg/dL로 비교적 안정적이에요 👏`,
      };
    }

    if (bpLogs.length && systolicAvg <= 130 && diastolicAvg <= 85) {
      return {
        message: `오늘 혈압 평균이 ${systolicAvg}/${diastolicAvg}로 비교적 안정적이에요.`,
      };
    }

    return {
      message: "오늘 기록을 잘 남기고 있어요. 수치 변화를 꾸준히 확인해보세요.",
    };
  } catch {
    return {
      message: "오늘의 인사이트를 불러오지 못했어요.",
    };
  }
}

/* ---------------- C) 빠른 통계 ---------------- */

export async function getQuickStats(): Promise<QuickStatsResponse> {
  try {
    const res = await get("/api/home/quick-stats");
    const data = unwrap<QuickStatsResponse>(res.data);
    if (
      data?.todayText ||
      data?.weekText ||
      data?.avgText ||
      data?.todayGlucoseCount != null
    ) {
      return data;
    }
  } catch {}

  try {
    const today = new Date();
    const todayStr = toYmd(today);

    const weekDates = getWeekDates(today);
    const weekStart = toYmd(weekDates[0]);
    const weekEnd = toYmd(weekDates[6]);

    const [todaySugarRaw, todayBpRaw, weekSugarRaw, weekBpRaw] = await Promise.all([
      getBloodSugarLogs(todayStr, todayStr),
      getBloodPressureLogs(todayStr, todayStr),
      getBloodSugarLogs(weekStart, weekEnd),
      getBloodPressureLogs(weekStart, weekEnd),
    ]);

    const todaySugar = normalizeArray<BloodSugarLog>(todaySugarRaw);
    const todayBp = normalizeArray<BloodPressureLog>(todayBpRaw);
    const weekSugar = normalizeArray<BloodSugarLog>(weekSugarRaw);
    const weekBp = normalizeArray<BloodPressureLog>(weekBpRaw);

    const weekGlucoseAvg = avg(weekSugar.map(getGlucoseValue).filter((v) => v > 0));

    return {
      todayText: `오늘: 혈당 ${todaySugar.length}회 | 혈압 ${todayBp.length}회`,
      weekText: `이번 주: 혈당 ${weekSugar.length}회 | 혈압 ${weekBp.length}회`,
      avgText: weekSugar.length
        ? `혈당 평균: ${weekGlucoseAvg} mg/dL`
        : "혈당 평균: -",
      todayGlucoseCount: todaySugar.length,
      todayBpCount: todayBp.length,
      weekGlucoseCount: weekSugar.length,
      weekBpCount: weekBp.length,
      weekGlucoseAvg,
    };
  } catch {
    return {
      todayText: "오늘: -",
      weekText: "이번 주: -",
      avgText: "혈당 평균: -",
    };
  }
}

/* ---------------- B) 차트 ---------------- */

export async function getHomeChart(period: Period): Promise<HomeChartResponse> {
  try {
    const res = await get(HOME_CHART_ENDPOINT, { params: { period } });
    const data = unwrap<HomeChartResponse>(res.data);

    if (
      data &&
      Array.isArray(data.labels) &&
      Array.isArray(data.glucose) &&
      Array.isArray(data.systolic) &&
      Array.isArray(data.diastolic)
    ) {
      return data;
    }
  } catch {}

  const { sugarLogs, bpLogs } = await fetchLogsForPeriod(period);
  const today = new Date();

  if (period === "week") {
    const days = getWeekDates(today);
    const labels = ["월", "화", "수", "목", "금", "토", "일"];

    const glucose = days.map((day) => {
      const list = sugarLogs.filter((item) => isSameYmd(getSugarMeasuredAt(item), day));
      return avg(list.map(getGlucoseValue).filter((v) => v > 0));
    });

    const systolic = days.map((day) => {
      const list = bpLogs.filter((item) => isSameYmd(getBpMeasuredAt(item), day));
      return avg(list.map(getSystolicValue).filter((v) => v > 0));
    });

    const diastolic = days.map((day) => {
      const list = bpLogs.filter((item) => isSameYmd(getBpMeasuredAt(item), day));
      return avg(list.map(getDiastolicValue).filter((v) => v > 0));
    });

    return {
      labels,
      glucose,
      systolic,
      diastolic,
      emojis: glucose.map(getEmojiFromGlucose),
    };
  }

  if (period === "month") {
    const weeks = getMonthWeekRanges(today);

    return {
      labels: weeks.map((w) => w.label),
      glucose: weeks.map((w) =>
        avg(
          sugarLogs
            .filter((item) => inRange(getSugarMeasuredAt(item), w.start, w.end))
            .map(getGlucoseValue)
            .filter((v) => v > 0)
        )
      ),
      systolic: weeks.map((w) =>
        avg(
          bpLogs
            .filter((item) => inRange(getBpMeasuredAt(item), w.start, w.end))
            .map(getSystolicValue)
            .filter((v) => v > 0)
        )
      ),
      diastolic: weeks.map((w) =>
        avg(
          bpLogs
            .filter((item) => inRange(getBpMeasuredAt(item), w.start, w.end))
            .map(getDiastolicValue)
            .filter((v) => v > 0)
        )
      ),
      emojis: weeks.map((w) =>
        getEmojiFromGlucose(
          avg(
            sugarLogs
              .filter((item) => inRange(getSugarMeasuredAt(item), w.start, w.end))
              .map(getGlucoseValue)
              .filter((v) => v > 0)
          )
        )
      ),
    };
  }

  const glucoseAll = sugarLogs.map(getGlucoseValue).filter((v) => v > 0);
  const systolicAll = bpLogs.map(getSystolicValue).filter((v) => v > 0);
  const diastolicAll = bpLogs.map(getDiastolicValue).filter((v) => v > 0);

  return {
    labels: ["전체"],
    glucose: [avg(glucoseAll)],
    systolic: [avg(systolicAll)],
    diastolic: [avg(diastolicAll)],
    emojis: [getEmojiFromGlucose(avg(glucoseAll))],
  };
}