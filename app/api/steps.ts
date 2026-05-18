import { get, post } from "./index";
import AppleHealthKit from "react-native-health";

/* ---------------- types ---------------- */

export type StepSource = "APPLE_HEALTH" | "GOOGLE_FIT" | "MANUAL" | string;

export type StepSyncRequest = {
  stepDate: string;
  steps: number;
  source: StepSource;
};

export type StepSyncResponse = {
  stepDate: string;
  steps: number;
  source: StepSource;
  syncedAt?: string;
};

/* ---------------- utils ---------------- */

function getTodayKST() {
  // YYYY-MM-DD (로컬 기준)
  return new Date().toLocaleDateString("en-CA");
}

function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getNow() {
  return new Date().toISOString();
}

/* ---------------- MAIN SYNC ---------------- */

export async function syncStepsFromHealthKit() {
  console.log("🚀 [SYNC] 시작");

  return new Promise((resolve, reject) => {
    const permissions = {
      permissions: {
        read: ["StepCount"],
        write: [],
      },
    };

    console.log("📌 HealthKit init");

    AppleHealthKit.initHealthKit(permissions, (err) => {
      if (err) {
        console.log("❌ initHealthKit 실패:", err);
        return reject(err);
      }

      console.log("✅ HealthKit init 성공");

      const options = {
        startDate: getTodayStart(),
        endDate: getNow(),
      };

      console.log("👣 StepCount 요청 옵션:", options);

      AppleHealthKit.getStepCount(options, async (err, result) => {
        if (err) {
          console.log("❌ getStepCount 에러:", err);
          return reject(err);
        }

        console.log("📊 RAW HealthKit result:", result);

        // 🔥 안전 파싱 (버전마다 구조 다름)
        const steps =
          result?.value ??
          result?.quantity ??
          result?.steps ??
          result ??
          0;

        console.log("👣 PARSED steps:", steps);

        const payload: StepSyncRequest = {
          stepDate: getTodayKST(),
          steps: Number(steps),
          source: "APPLE_HEALTH",
        };

        console.log("📡 서버 전송 payload:", payload);

        try {
          const res = await post("/api/records/steps/sync", payload);
          console.log("✅ 서버 응답:", res);
          resolve(res);
        } catch (e) {
          console.log("❌ 서버 전송 실패:", e);
          reject(e);
        }
      });
    });
  });
}

/* ---------------- API WRAPPERS ---------------- */

export async function syncSteps(payload?: StepSyncRequest) {
  try {
    const res = payload
      ? await post("/api/records/steps/sync", payload)
      : await post("/api/records/steps/sync");

    return res?.data ?? res;
  } catch (e) {
    console.error("steps sync error", e);
    return null;
  }
}

/* ---------------- TODAY ---------------- */

export async function getTodaySteps() {
  try {
    const res = await get("/api/records/steps/today");
    return res?.data ?? res;
  } catch {
    return { steps: 0 };
  }
}