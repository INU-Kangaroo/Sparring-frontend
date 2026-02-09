import { Platform } from "react-native";
import { post } from "./index";

const saveUserTokens = async (tokens) => {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("userTokens", JSON.stringify(tokens));
    }
    return;
  }

  globalThis.__userTokens = tokens;
};

export const loginApi = async (data) => {
  try {
    const response = await post("/v1/auth/login", { ...data });

    const tokenData = {
      accessToken: response?.data?.data?.accessToken,
      refreshToken: response?.data?.data?.refreshToken,
    };

    if (!tokenData.accessToken) {
      throw new Error("로그인 응답에 accessToken이 없습니다.");
    }

    await saveUserTokens(tokenData);
    return response.status;
  } catch (error) {
    if (error?.response) {
      console.error("응답 오류 데이터:", error.response.data);
      console.error("응답 상태 코드:", error.response.status);
      console.error("응답 헤더:", error.response.headers);
    } else if (error?.request) {
      console.error("요청 오류:", error.request);
    } else {
      console.error("오류 메시지:", error?.message);
    }

    throw new Error("로그인에 실패했습니다.");
  }
};