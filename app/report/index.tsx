import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ReportScreen() {
  // ✅ 더미 데이터 (나중에 AI/백엔드로 교체)
  const userName = "OOO";

  // ✅ 지금은 하드코딩(나중에 AI로 숫자만 받아오면 됨)
  const recordDaysNum = "7";
  const fastingNum = "102";
  const afterMealNum = "138";

  const summaryTitle = "건강관리 상태 ~~";
  const summaryText =
    "두바이초콜릿쿠키 같은 고칼로리 음식 섭취를 줄여야 합니다. 하지만 맛있는거 압니다.. 그래도 줄여야 혈당도 낮추고 내 맘도 그래요!!";

  const goBack = () => router.back();
  const goPastReports = () => {
    // TODO: 지난 보고서 화면 라우팅 연결
    // router.push("/report/history");
    console.log("TODO: 지난 보고서 보러가기");
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단 뒤로가기 */}
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
      </View>

      <View style={styles.container}>
        {/* 타이틀 */}
        <Text style={styles.title}>
          {userName}님의{"\n"}
          <Text style={styles.titleAccent}>이번 주 혈당 분석</Text>{" "}
          결과입니다!
        </Text>

        {/* ✅ 상단 stats 영역: (탭용 gradient bar 32px, 세로그라데이션/위가 진함) + (텍스트는 아래에서 시작) */}
        <View style={styles.statsWrap}>
          <LinearGradient
            colors={["#E8E8E8", "#f2f2f2"]} // 위 진함 -> 아래 연함
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }} // ✅ 세로 그라데이션
            style={styles.statBarBg}
          />

          <View style={styles.statsContent}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>기록일</Text>
              <Text>
                <Text style={styles.valueNumber}>{recordDaysNum}</Text>
                <Text style={styles.valueUnit}>일</Text>
              </Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>식전 혈당</Text>
              <Text>
                <Text style={styles.valueNumber}>{fastingNum}</Text>
                <Text style={styles.valueUnit}>mg/dl</Text>
              </Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>식후 혈당</Text>
              <Text>
                <Text style={styles.valueNumber}>{afterMealNum}</Text>
                <Text style={styles.valueUnit}>mg/dl</Text>
              </Text>
            </View>
          </View>

          <View style={styles.statsDivider} />
        </View>

        {/* 클립보드 카드 영역 */}
        <View style={styles.clipboardWrap}>
          <Image
            source={require("../../assets/images/subtract.png")}
            style={styles.clipTop}
            resizeMode="contain"
          />

          <View style={styles.paper}>
            <Text style={styles.paperTitle}>{summaryTitle}</Text>
            <Text style={styles.paperBody}>{summaryText}</Text>
          </View>
        </View>

        {/* 하단 버튼 */}
        <Pressable
          onPress={goPastReports}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.btnText}>지난 보고서 보러가기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  header: {
    height: 54,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  /* 타이틀 */
  title: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "700", // Bold
    color: "#111",
    lineHeight: 28,
  },
  titleAccent: {
    color: "#3F7BFF",
    fontWeight: "700",
  },

  /* ✅ stats 영역 */
  statsWrap: {
    width: 349,
    alignSelf: "center",
    marginTop: 18,
  },

  // 탭처럼 보이는 상단 둥근 배경 (w=349, h=32)
  statBarBg: {
    width: 349,
    height: 32,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  // 텍스트는 rectangle 아래에서 시작
  statsContent: {
    width: 349,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingTop: 10,
  },

  statCol: {
    alignItems: "center",
  },

  statLabel: {
    fontSize: 13,
    fontWeight: "500", // medium
    color: "#777",
  },

  // ✅ 숫자만 파랑
  valueNumber: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600", // semibold
    color: "#3F7BFF",
  },

  // ✅ 단위는 검정
  valueUnit: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  statsDivider: {
    width: 349,
    height: 1,
    backgroundColor: "#E6E6E6",
    marginTop: 12,
  },

  /* 클립보드 영역 */
  clipboardWrap: {
    marginTop: 22,
    alignItems: "center",
  },

  clipTop: {
    width: 180,
    height: 60,
    marginBottom: -10,
    zIndex: 2,
  },

  paper: {
    width: 254,
    minHeight: 330,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },

  paperTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },

  paperBody: {
    fontSize: 12.5,
    fontWeight: "400",
    color: "#666",
    lineHeight: 18,
  },

  /* 버튼 */
  btn: {
    marginTop: 40,
    alignSelf: "center",
    width: 214,
    height: 44,
    borderRadius: 28,
    backgroundColor: "#3B3B3B",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
