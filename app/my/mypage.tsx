// app/my/mypage.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function MyPage() {
  const goProfile = () => router.push("/my/profile");
  const goHome = () => router.replace("/"); // 홈 경로에 맞게 수정 가능

  return (
    <SafeAreaView style={styles.safe}>
      {/* 메인 콘텐츠 */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* 상단 아이콘 영역 */}
          <View style={styles.topBar}>
            <View />
            <View style={styles.topIcons}>
              <Pressable hitSlop={8}>
                <Ionicons name="notifications-outline" size={22} color="#444" />
              </Pressable>
              <Pressable hitSlop={8}>
                <Ionicons name="settings-outline" size={22} color="#444" />
              </Pressable>
            </View>
          </View>

          {/* 프로필 카드 */}
          <View style={styles.profileCard}>
            <View style={styles.avatar} />

            <View style={styles.profileTextArea}>
              <Text style={styles.userName}>유저 이름</Text>

              <Pressable onPress={goProfile} hitSlop={10}>
                <Text style={styles.myInfoLink}>내 정보 확인하기 &gt;</Text>
              </Pressable>
            </View>
          </View>

          {/* 요약 카드 */}
          <View style={styles.summaryArea}>
            <SummaryCard title="최근 혈압" value="120 / 80" />
            <SummaryCard title="최근 혈당" value="98 mg/dL" />
            <SummaryCard title="이번 주 기록" value="5회" />
          </View>
        </View>
      </ScrollView>

      {/* 하단 홈 버튼 */}
      <View style={styles.homeBar}>
        <Pressable
          onPress={goHome}
          style={({ pressed }) => pressed && { opacity: 0.9 }}
        >
          <LinearGradient
            colors={["#6FA8FF", "#5A80FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeBtn}
          >
            <Ionicons name="home" size={20} color="white" />
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  scrollContent: {
    paddingBottom: 120, // 홈 버튼 가리지 않게
  },

  contentWrapper: {
    marginTop: 44,
  },

  /* 상단 */
  topBar: {
    height: 44,
    justifyContent: "center",
  },
  topIcons: {
    position: "absolute",
    right: 0,
    flexDirection: "row",
    gap: 16,
    paddingRight: 6,
  },

  /* 프로필 카드 */
  profileCard: {
    width: 339,
    height: 96,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 14,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: "#E6E6E6",
  },

  profileTextArea: {
    marginLeft: 14,
    justifyContent: "center",
  },

  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  myInfoLink: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
    color: "#9A9A9A",
  },

  /* 요약 카드 */
  summaryArea: {
    marginTop: 26,
    gap: 16,
  },

  summaryCard: {
    width: 339,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#777",
  },

  summaryValue: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  /* 하단 홈 버튼 */
  homeBar: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
  },

  homeBtn: {
    width: 140, // ⬅️ 가로 길게
    height: 56,
    borderRadius: 28, // height / 2 → 알약 모양
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
