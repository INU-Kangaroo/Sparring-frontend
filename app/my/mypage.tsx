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

export default function MyPage() {
  const goProfile = () => router.push("/my/profile");

  return (
    <SafeAreaView style={styles.safe}>
      {/* ✅ 전체가 아래로 내려오게: contentWrapper에 marginTop */}
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
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#444"
                />
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

  // ScrollView content padding (하단 여백)
  scrollContent: {
    paddingBottom: 40,
  },

  // ✅ 여기 marginTop으로 “전체 영역”을 아래로 내림
  contentWrapper: {
    marginTop: 44, // 🔥 더 내리고 싶으면 32~40으로 올려도 됨
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

  /* 프로필 카드 (요청 스펙) */
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

  // ✅ 폰트 스펙 반영
  userName: {
    fontSize: 15,
    fontWeight: "600", // semibold
    color: "#111",
  },

  myInfoLink: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500", // medium
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
});
