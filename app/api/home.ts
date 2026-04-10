import { get } from "./index";

/* ---------------- utils ---------------- */

function unwrap<T = any>(resData: any): T {
  if (resData == null) return resData as T;
  if (typeof resData === "object" && "data" in resData) {
    return resData.data as T;
  }
  return resData as T;
}

/* ---------------- types ---------------- */

export type HomeCard = {
  name: string;
  profileImageUrl?: string;
  displayDate: string;
  tags: string[];
};

export type TodayInsight = {
  type?: string;
  message: string;
};

export type BloodSugarPoint = {
  date: string;
  averageBloodSugarMgDl: number | null;
};

export type BloodSugarChart = {
  startDate: string;
  endDate: string;
  points: BloodSugarPoint[];
};

export type Steps = {
  stepDate: string;
  totalSteps: number;
};

export type HomeResponse = {
  profileCard: HomeCard;
  todayInsight: TodayInsight;
  bloodSugarChart: BloodSugarChart;
  steps: Steps;
};

/* ---------------- API ---------------- */

export async function getHome(): Promise<HomeResponse> {
  try {
    const res = await get("/api/home");
    const data = unwrap<HomeResponse>(res.data);

    if (data?.profileCard) return data;
  } catch (e) {
    console.log("home api error", e);
  }

  // fallback
  return {
    profileCard: {
      name: "사용자",
      profileImageUrl: "",
      displayDate: "",
      tags: [],
    },
    todayInsight: {
      message: "데이터를 불러올 수 없습니다.",
    },
    bloodSugarChart: {
      startDate: "",
      endDate: "",
      points: [],
    },
    steps: {
      stepDate: "",
      totalSteps: 0,
    },
  };
}

/* ---------------- 변환 함수 ---------------- */

export function convertChartData(chart: BloodSugarChart) {
  const labels = chart.points.map((p) => {
  const d = new Date(p.date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
});

  const glucose = chart.points.map((p) =>
    p.averageBloodSugarMgDl ?? 0
  );

  return { labels, glucose };
}