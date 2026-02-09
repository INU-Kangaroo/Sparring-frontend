import { Platform } from "react-native";

let AsyncStorageLib = null;

if (Platform.OS !== "web") {
  try {
    AsyncStorageLib =
      require("@react-native-async-storage/async-storage").default;
  } catch (e) {
    console.error("AsyncStorage 로드 실패:", e);
  }
}

export const getTokenFromStorage = async () => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem("accessToken");
    }
    if (!AsyncStorageLib) return null;
    return await AsyncStorageLib.getItem("accessToken");
  } catch (e) {
    console.error("토큰 가져오기 실패:", e);
    return null;
  }
};

export const setTokenToStorage = async (token) => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem("accessToken", token);
      return;
    }
    if (!AsyncStorageLib) return;
    await AsyncStorageLib.setItem("accessToken", token);
  } catch (e) {
    console.error("토큰 저장 실패:", e);
  }
};

export const removeTokenFromStorage = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem("accessToken");
      return;
    }
    if (!AsyncStorageLib) return;
    await AsyncStorageLib.removeItem("accessToken");
  } catch (e) {
    console.error("토큰 삭제 실패:", e);
  }
};
