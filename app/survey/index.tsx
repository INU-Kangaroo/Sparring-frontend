import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function SurveyIntroScreen() {
  const onStart = () => {
    // TODO: 나중에 설문 1번 화면 만들면 그쪽으로 이동
    router.push("/survey/survey1");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.text}>
            맞춤형 설정을 위해{"\n"}설문조사를 실시해주세요!
          </Text>

          <Pressable style={styles.startBtn} onPress={onStart}>
            <Text style={styles.startText}>▶ 실시하기</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  card: {
    height: 420, // 화면에 보이는 큰 박스 느낌
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 18,
  },
  startBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  startText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C4C4C4", // 이미지처럼 비활성 느낌의 회색
  },
});
