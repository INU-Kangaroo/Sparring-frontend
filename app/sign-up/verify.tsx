import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import CodeInput from "../../components/CodeInput";
import NextButton from "../../components/NextButton";

export default function Verify() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleNext = () => {
    if (code.some((v) => v === "")) return;
    router.push("/sign-up/password");
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={() => router.back()} />

      <Text style={styles.heading}>나의 건강 시그널을 확인하고 싶다면?</Text>
      <Text style={styles.heading2}>3초만에 회원가입!</Text>

      <Text style={styles.subtext}>인증번호를 입력해주세요</Text>

      <View style={{ flexDirection: "row", alignSelf: "flex-start" }}>
      <Text style={styles.subtext2}>인증번호</Text>
      <Text style={styles.star}> *</Text>
      </View>

      

      <CodeInput code={code} setCode={setCode} />

<View style={styles.resendContainer}>
  <Text style={styles.resendText}>메일을 못 받으셨나요? </Text>

      <TouchableOpacity onPress={() => {
        // TODO: 재인증 API 호출
        console.log("재인증");
        }}>
        <Text style={styles.resendLink}>재인증</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: "auto", width: "100%" }}>
        <NextButton title="다음" onPress={handleNext} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    paddingHorizontal: 1,
  },
  heading: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "600",
    color: "#1e1d1dff",
  },
  heading2: {
    marginTop: 5,
    fontSize: 20,
    alignSelf: "flex-start",
    fontWeight: "600",
    color: "#1e1d1dff",
  },
  subtext: {
    marginTop: 70,
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "500",
    color: "#1e1d1dff",
  },
  subtext2: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#1e1d1dff",
    marginVertical: 10,
  },
    star: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#fa1212ff",
    marginVertical: 10,
  },
  resendContainer: {
    flexDirection: "row",
    marginTop: 25,
    alignSelf: "flex-start",
  },
  resendText: {
    fontSize: 13,
    color: "#9e9e9e", // 회색
  },
  resendLink: {
    fontSize: 13,
    color: "#626262ff", 
    fontWeight: "600"
  },
});
