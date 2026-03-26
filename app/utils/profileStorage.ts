import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type SignupProfile = {
  email?: string;
  username?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | string;
  height?: number;
  weight?: number;
  profileImageUrl?: string;
};

export type StoredSurveyAnswerValue = string | number | boolean | string[];

export type StoredSurveyAnswerItem = {
  questionKey: string;
  value: StoredSurveyAnswerValue;
};

const SIGNUP_PROFILE_KEY = "signupProfile";
const SURVEY_ANSWERS_KEY = "surveyAnswers";

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function saveSignupProfile(profile: SignupProfile) {
  const existing = await getSignupProfile();
  const merged = { ...existing, ...profile };
  await setItem(SIGNUP_PROFILE_KEY, JSON.stringify(merged));
}

export async function getSignupProfile(): Promise<SignupProfile> {
  const raw = await getItem(SIGNUP_PROFILE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveSurveyAnswers(answers: StoredSurveyAnswerItem[]) {
  await setItem(SURVEY_ANSWERS_KEY, JSON.stringify(answers));
}

export async function getSurveyAnswersFromStorage(): Promise<StoredSurveyAnswerItem[]> {
  const raw = await getItem(SURVEY_ANSWERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function updateStoredSurveyAnswer(
  questionKey: string,
  value: StoredSurveyAnswerValue
) {
  const existing = await getSurveyAnswersFromStorage();
  const filtered = existing.filter((item) => item.questionKey !== questionKey);
  filtered.push({ questionKey, value });
  await saveSurveyAnswers(filtered);
}
