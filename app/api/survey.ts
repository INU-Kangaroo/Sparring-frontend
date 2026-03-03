import { get, post, patch } from "./index";

export async function getSurveyQuestions() {
  const res = await get("/api/surveys/questions");
  return res.data?.data ?? res.data;
}

export async function submitSurveyAnswers(payload: any) {
  const res = await post("/api/surveys", payload);
  return res.data?.data ?? res.data;
}

export async function updateSurveyAnswers(payload: any) {
  const res = await patch("/api/surveys/answers", payload);
  return res.data?.data ?? res.data;
}

export async function getSurveyCompleted() {
  const res = await get("/api/surveys/completed");
  return res.data?.data ?? res.data;
}

export async function getSurveyAnswers() {
  const res = await get("/api/surveys/answers");
  return res.data?.data ?? res.data;
}