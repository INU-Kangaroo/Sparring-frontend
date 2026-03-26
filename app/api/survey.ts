import { get, post, put } from "./index";

export type SurveyAnswerValue = string | number | boolean | string[];

export type SurveyAnswerItem = {
  questionKey: string;
  value: SurveyAnswerValue;
};

export type SurveyQuestionsResponse = {
  questions: {
    questionKey: string;
    questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT" | "NUMBER";
    questionText: string;
    isRequired: boolean;
    options: { code: string; label: string }[] | null;
  }[];
};

export type SubmitSurveyRequest = {
  answers: SurveyAnswerItem[];
};

export type UpdateSurveyAnswerRequest = {
  questionKey: string;
  value: SurveyAnswerValue;
};

function unwrap<T = any>(resData: any): T {
  if (resData == null) return resData as T;
  if (typeof resData === "object" && "data" in resData) return resData.data as T;
  return resData as T;
}

export async function getSurveyQuestions(): Promise<SurveyQuestionsResponse> {
  const res = await get("/api/surveys/questions");
  return unwrap<SurveyQuestionsResponse>(res.data);
}

export async function submitSurvey(payload: SubmitSurveyRequest) {
  const res = await post("/api/surveys", payload);
  return unwrap(res.data);
}

export async function updateSurveyAnswer(payload: UpdateSurveyAnswerRequest) {
  const res = await put("/api/surveys/answers", payload);
  return unwrap(res.data);
}

export async function getSurveyCompleted() {
  const res = await get("/api/surveys/completed");
  return unwrap(res.data);
}

export async function getSurveyAnswers() {
  const res = await get("/api/surveys/answers");
  return unwrap(res.data);
}