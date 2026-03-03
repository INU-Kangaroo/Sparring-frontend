import { post } from "./index";

export type Gender = "MALE" | "FEMALE";
export type BloodSugarStatus = "NORMAL" | "BORDERLINE" | "TYPE1" | "TYPE2" | "UNKNOWN";
export type BloodPressureStatus =
  | "NORMAL"
  | "BORDERLINE"
  | "PRIMARY_HYPERTENSION"
  | "SECONDARY_HYPERTENSION"
  | "UNKNOWN";

export type SignupRequest = {
  email: string;
  password: string;
  username: string;
  birthDate: string; 
  gender: Gender;
  height: number;
  weight: number;
  bloodSugarStatus: BloodSugarStatus;
  bloodPressureStatus: BloodPressureStatus;
  medications: string;
  allergies: string;
  healthGoal: string;
  hasFamilyHypertension: boolean;
};

export type SignupResponse = {
  email?: string;
  message?: string;
  [key: string]: any;
};

export const signupApi = async (payload: SignupRequest) => {
  const res = await post<SignupResponse>("/api/auth/signup", payload);
  return res.data?.data ?? res.data;
};