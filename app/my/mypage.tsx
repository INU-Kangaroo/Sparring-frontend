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
  const goHome = () => router.replace("/main/main");

  const userName = "유저 이름";
  const totalMeasurements = 234;
  const streakDays = 14;
  const avgGlucose = 125;
  const recentAvgGlucose = 120;

  const basicInfo = {
    name: "유저 이름",
    birth: "0000.00.00",
    gender: "미설정",
    height: "000 cm",
    weight: "00 kg",
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>

          {/* 프로필 카드 */}
          <View style={styles.profileCard}>
            <View style={styles.avatar} />
            <View style={styles.profileTextArea}>
              <Text style={styles.userName}>{userName}</Text>
              <Pressable onPress={goProfile} hitSlop={10}>
                <Text style={styles.myInfoLink}>내 정보 수정하기 &gt;</Text>
              </Pressable>
            </View>
          </View>

          {/* 나의 기록 섹션 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📊</Text>
            <Text style={styles.sectionTitle}>나의 기록</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>총 측정 횟수</Text>
                <Text style={styles.statValue}>
                  <Text style={styles.statAccent}>{totalMeasurements}</Text>
                  <Text style={styles.statUnit}>회</Text>
                </Text>
              </View>
              <View style={styles.statDividerV} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>연속 측정</Text>
                <Text style={styles.statValue}>
                  <Text style={styles.statAccent}>{streakDays}</Text>
                  <Text style={styles.statUnit}>일</Text>
                </Text>
              </View>
            </View>

            <View style={styles.statDividerH} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>평균 혈당</Text>
              <Text style={styles.infoValueAccent}>{avgGlucose} mg/dL</Text>
            </View>
            <View style={[styles.infoRow, { marginTop: 10 }]}>
              <Text style={styles.infoLabel}>최근 7일 평균</Text>
              <Text style={styles.infoValueAccent}>{recentAvgGlucose} mg/dL</Text>
            </View>
          </View>

          {/* 기본 정보 섹션 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👤</Text>
            <Text style={styles.sectionTitle}>기본 정보</Text>
          </View>

          <View style={styles.card}>
            {Object.entries({
              이름: basicInfo.name,
              생년월일: basicInfo.birth,
              성별: basicInfo.gender,
              키: basicInfo.height,
              몸무게: basicInfo.weight,
            }).map(([label, value], i, arr) => (
              <View key={label}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.statDividerH} />}
              </View>
            ))}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  container: { flex: 1, paddingHorizontal: 18 },
  scrollContent: { paddingBottom: 120 },
  contentWrapper: { marginTop: 44 },

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
  avatar: { width: 58, height: 58, borderRadius: 999, backgroundColor: "#E6E6E6" },
  profileTextArea: { marginLeft: 14, justifyContent: "center" },
  userName: { fontSize: 15, fontWeight: "600", color: "#111" },
  myInfoLink: { marginTop: 6, fontSize: 12, fontWeight: "500", color: "#9A9A9A" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#222" },

  card: {
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

  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 4,
  },
  statItem: { alignItems: "center", flex: 1 },
  statLabel: { fontSize: 12, fontWeight: "600", color: "#999", marginBottom: 6 },
  statValue: { fontSize: 16 },
  statAccent: { fontSize: 22, fontWeight: "800", color: "#3F7BFF" },
  statUnit: { fontSize: 13, fontWeight: "600", color: "#555" },
  statDividerV: { width: 1, height: 40, backgroundColor: "#F0F0F0" },
  statDividerH: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { fontSize: 13, fontWeight: "600", color: "#888" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#222" },
  infoValueAccent: { fontSize: 13, fontWeight: "700", color: "#3F7BFF" },

  homeBar: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  homeBtn: {
    width: 140,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});