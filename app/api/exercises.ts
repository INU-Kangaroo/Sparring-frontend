import { get, post } from "./index";

export type ExerciseIntensity = "LOW" | "MEDIUM" | "HIGH";

export type ExerciseCreateRequest = {
  exerciseName: string;      // 운동 이름
  durationMinutes: number;   // 운동 시간 (분)
  intensity: ExerciseIntensity; // 강도: LOW, MEDIUM, HIGH
  loggedAt: string;          // 기록한 시간 (ISO 8601 형식, e.g., "2026-03-08T17:30:37.909Z")
};

export type ExerciseLog = {
  id: number;
  exerciseName: string;
  durationMinutes: number;
  caloriesBurned: number;
  loggedAt: string;
};

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

/**
 * 운동 기록 저장
 * @param payload 운동 기록 데이터
 * @returns 저장된 운동 기록
 */
export async function createExerciseLog(payload: ExerciseCreateRequest) {
  const res = await post("/api/exercises/logs", payload);
  return unwrap<ExerciseLog>(res);
}

/**
 * 운동 기록 일별 조회
 * @param date 조회할 날짜 (yyyy-MM-dd 형식, e.g., "2026-03-08")
 * @returns 해당 날짜의 운동 기록 목록
 */
export async function getExercisesDaily(date: string) {
  const res = await get("/api/exercises/logs/daily", {
    params: { date },
  });
  return unwrap<ExerciseLog[] | any>(res);
}

/**
 * 운동 기록 조회
 * @param startDate 조회 시작 날짜 (yyyy-MM-dd 형식)
 * @param endDate 조회 종료 날짜 (yyyy-MM-dd 형식)
 * @returns 해당 기간의 운동 기록 목록
 */
export async function getExerciseLogs(startDate: string, endDate: string) {
  const res = await get("/api/exercises/logs", {
    params: { startDate, endDate },
  });
  return unwrap<ExerciseLog[] | any>(res);
}
