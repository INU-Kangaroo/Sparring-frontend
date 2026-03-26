import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}
async function getItem(key: string) {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}
async function removeItem(key: string) {
  if (Platform.OS === "web") localStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}

export async function setTokensToStorage(accessToken: string, refreshToken?: string) {
  await setItem(ACCESS_KEY, accessToken);
  if (refreshToken) await setItem(REFRESH_KEY, refreshToken);
}

export async function getAccessTokenFromStorage() {
  return (await getItem(ACCESS_KEY)) ?? "";
}

export async function getRefreshTokenFromStorage() {
  return (await getItem(REFRESH_KEY)) ?? "";
}

export async function removeTokenFromStorage() {
  await removeItem(ACCESS_KEY);
  await removeItem(REFRESH_KEY);
}

// 기존 코드 호환 (AccessToken만 쓰던 함수명)
export async function setTokenToStorage(token: string) {
  await setItem(ACCESS_KEY, token);
}
export async function getTokenFromStorage() {
  return await getAccessTokenFromStorage();
}