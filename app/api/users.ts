import { del, get, patch } from "./index";

export type UserProfileResponse = {
  userId: number;
  username: string;
  email: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | string;
  height?: number;
  weight?: number;
  profileImageUrl?: string;
  socialProvider?: string;
};

export type UpdateUserProfileRequest = Partial<{
  username: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | string;
  height: number;
  weight: number;
  profileImageUrl: string;
}>;

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UserDashboardResponse = {
  profile?: {
    username?: string;
    profileImageUrl?: string;
  };
  record?: {
    totalMeasurementCount?: number;
    consecutiveMeasurementDays?: number;
    averageBloodSugarMgDl?: number;
    last7DaysAverageBloodSugarMgDl?: number;
  };
  basicInfo?: {
    name?: string;
    birthDate?: string;
    gender?: "MALE" | "FEMALE" | string;
    height?: number;
    weight?: number;
    email?: string;
  };
};

function unwrap<T = any>(resData: any): T {
  if (resData == null) return resData as T;
  if (typeof resData === "object" && "data" in resData) return resData.data as T;
  return resData as T;
}

export async function getMyProfile(): Promise<UserProfileResponse> {
  const res = await get("/api/users/me");
  return unwrap<UserProfileResponse>(res.data);
}

export async function updateMyProfile(payload: UpdateUserProfileRequest) {
  const res = await patch("/api/users/me", payload);
  return unwrap<UserProfileResponse>(res.data);
}

export async function getMyDashboard(): Promise<UserDashboardResponse> {
  const res = await get("/api/users/me/dashboard");
  return unwrap<UserDashboardResponse>(res.data);
}

export async function deleteMyAccount() {
  const res = await del("/api/users/me");
  return unwrap(res.data);
}

export async function changeMyPassword(payload: ChangePasswordRequest) {
  const res = await patch("/api/users/me/password", payload);
  return unwrap(res.data);
}
