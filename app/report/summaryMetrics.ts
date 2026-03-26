import {
  getBloodPressureLogs,
  type BloodPressureLog,
} from "../api/bloodPressure";
import {
  getBloodSugarLogs,
  type BloodSugarLog,
} from "../api/bloodSugar";

export type ReportSummaryMetrics = {
  recordDays: number;
  bloodSugarCount: number;
  bloodPressureCount: number;
  totalMeasured: number;
  totalPossible: number;
  avgGlucose: number;
  normalCount: number;
  normalTotal: number;
  dayCounts: number[];
};

const DAYS_IN_WEEK = 7;
const TOTAL_WEEKLY_POSSIBLE = 21;

const avg = (arr: number[]) =>
  arr.length ? Math.round(arr.reduce((sum, value) => sum + value, 0) / arr.length) : 0;

const normalizeArray = <T = unknown>(raw: any): T[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const toDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameDay = (value: string, target: Date) => {
  const date = toDate(value);
  if (!date) return false;

  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
};

const getWeekDatesFromRange = (startDate: string, endDate: string) => {
  const start = toDate(startDate);
  const end = toDate(endDate);

  if (!start || !end) {
    return Array.from({ length: DAYS_IN_WEEK }, () => null);
  }

  const days: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= end && days.length < DAYS_IN_WEEK) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  while (days.length < DAYS_IN_WEEK) {
    const fallback = new Date(start);
    fallback.setDate(fallback.getDate() + days.length);
    fallback.setHours(0, 0, 0, 0);
    days.push(fallback);
  }

  return days;
};

const getGlucoseValue = (item: BloodSugarLog) => Number(item.glucoseLevel ?? 0);
const getBloodSugarMeasuredAt = (item: BloodSugarLog) => item.measuredAt ?? "";
const getBloodPressureMeasuredAt = (item: BloodPressureLog) => item.measuredAt ?? "";

const toYmdKey = (value: string) => {
  const date = toDate(value);
  if (!date) return null;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export async function getReportSummaryMetrics(
  startDate: string,
  endDate: string
): Promise<ReportSummaryMetrics> {
  if (!startDate || !endDate) {
    return {
      recordDays: 0,
      bloodSugarCount: 0,
      bloodPressureCount: 0,
      totalMeasured: 0,
      totalPossible: TOTAL_WEEKLY_POSSIBLE,
      avgGlucose: 0,
      normalCount: 0,
      normalTotal: 0,
      dayCounts: Array(DAYS_IN_WEEK).fill(0),
    };
  }

  const [bloodSugarRaw, bloodPressureRaw] = await Promise.all([
    getBloodSugarLogs(startDate, endDate),
    getBloodPressureLogs(startDate, endDate),
  ]);

  const bloodSugarLogs = normalizeArray<BloodSugarLog>(bloodSugarRaw);
  const bloodPressureLogs = normalizeArray<BloodPressureLog>(bloodPressureRaw);
  const glucoseValues = bloodSugarLogs.map(getGlucoseValue).filter((value) => value > 0);
  const recordedDays = new Set(
    [...bloodSugarLogs, ...bloodPressureLogs]
      .map((item) => toYmdKey(item.measuredAt ?? ""))
      .filter((value): value is string => Boolean(value))
  );
  const weekDates = getWeekDatesFromRange(startDate, endDate);
  const dayCounts = weekDates.map((date) => {
    if (!date) return 0;

    const sugarCount = bloodSugarLogs.filter((item) =>
      isSameDay(getBloodSugarMeasuredAt(item), date)
    ).length;
    const pressureCount = bloodPressureLogs.filter((item) =>
      isSameDay(getBloodPressureMeasuredAt(item), date)
    ).length;

    return sugarCount + pressureCount;
  });

  return {
    recordDays: recordedDays.size,
    bloodSugarCount: bloodSugarLogs.length,
    bloodPressureCount: bloodPressureLogs.length,
    totalMeasured: bloodSugarLogs.length + bloodPressureLogs.length,
    totalPossible: TOTAL_WEEKLY_POSSIBLE,
    avgGlucose: avg(glucoseValues),
    normalCount: glucoseValues.filter((value) => value <= 120).length,
    normalTotal: bloodSugarLogs.length,
    dayCounts,
  };
}
