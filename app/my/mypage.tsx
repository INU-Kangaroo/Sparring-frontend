import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
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
import { useFocusEffect } from "@react-navigation/native";
import { getMyDashboard, getMyProfile } from "../api/users";
import Colors from "@/constants/Colors";
import {
  getSignupProfile,
  getSurveyAnswersFromStorage,
  type StoredSurveyAnswerItem,
} from "../utils/profileStorage";

type BasicInfo = {
  name: string;
  birth: string;
  gender: string;
  email: string;
  height: string;
  weight: string;
};
type RecordInfo = {
  totalMeasurements: number;
  streakDays: number;
  avgGlucose: number;
  recentAvgGlucose: number;
};

const FALLBACK_TEXT = "미입력";

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

const surveyValueMap: Record<string, Record<string, string>> = {
  BLOOD_SUGAR_STATUS: {
    NORMAL: "정상",
    BORDERLINE: "경계성",
    TYPE1: "제1형",
    TYPE2: "제2형",
    UNKNOWN: "모름",
  },
  BLOOD_PRESSURE_STATUS: {
    NORMAL: "정상",
    BORDERLINE: "경계성",
    STAGE1: "1차고혈압",
    STAGE2: "2차고혈압",
    UNKNOWN: "모름",
  },
  MEAL_FREQUENCY: {
    ZERO: "0회",
    ONE_TO_TWO: "1~2회",
    TWO_TO_THREE: "2~3회",
    THREE_TO_FOUR: "3~4회",
    FOUR_TO_FIVE: "4~5회",
  },
  FOOD_PREFERENCE: {
    CARB_HEAVY: "탄수화물 위주",
    PROTEIN_HEAVY: "단백질 위주",
    PROCESSED_FOOD_HEAVY: "가공식품 위주",
    VEGETARIAN: "채식",
  },
  SUGAR_INTAKE_FREQ: {
    NONE: "주 0회",
    ONE_TO_TWO_PER_WEEK: "주 1~2회",
    THREE_TO_FOUR_PER_WEEK: "주 3~4회",
    FIVE_TO_SIX_PER_WEEK: "주 5~6회",
    DAILY: "매일",
  },
  CAFFEINE_INTAKE: {
    true: "예",
    false: "아니오",
  },
  EXERCISE_FREQUENCY: {
    ZERO: "0회",
    ONE_TO_TWO: "1~2회",
    TWO_TO_THREE: "2~3회",
    THREE_TO_FOUR: "3~4회",
    FOUR_TO_FIVE: "4~5회",
    DAILY: "매일",
  },
  EXERCISE_PLACE: {
    GYM_FACILITY: "운동시설 위주",
    HOME: "집",
    OUTDOOR: "야외",
    WORK_SCHOOL: "직장/학교",
  },
  SLEEP_QUALITY: {
    GOOD: "좋음",
    NORMAL: "보통",
    BAD: "나쁨",
  },
  DRINKING_FREQUENCY: {
    NONE: "없음",
    ONE_TO_TWO_PER_WEEK: "주 1~2회",
    THREE_OR_MORE_PER_WEEK: "주 3회 이상",
  },
  STRESS_LEVEL: {
    LOW: "낮음",
    MEDIUM: "중간",
    HIGH: "높음",
  },
};

function formatBirthDate(value?: string) {
  if (!value) return FALLBACK_TEXT;
  return value.replace(/-/g, ".");
}

function formatSurveyValue(item: StoredSurveyAnswerItem) {
  const { questionKey, value } = item;

  if (Array.isArray(value)) {
    const labels = value.map((entry) => surveyValueMap[questionKey]?.[entry] ?? entry);
    return labels.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "예" : "아니오";
  }

  if (typeof value === "number") {
    if (questionKey === "HEIGHT") return `${value} cm`;
    if (questionKey === "WEIGHT") return `${value} kg`;
    if (questionKey === "AVG_STEPS") return `${value} 보`;
    if (questionKey === "SLEEP_HOURS") return `${value} 시간`;
    return String(value);
  }

  return surveyValueMap[questionKey]?.[value] ?? value;
}

export default function MyPage() {
  const goProfile = () => router.push("/my/profile");
  const goHome = () => router.replace("/main/main");

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: FALLBACK_TEXT,
    birth: FALLBACK_TEXT,
    gender: FALLBACK_TEXT,
    email: FALLBACK_TEXT,
    height: FALLBACK_TEXT,
    weight: FALLBACK_TEXT,
  });
  const [recordInfo, setRecordInfo] = useState<RecordInfo>({
    totalMeasurements: 0,
    streakDays: 0,
    avgGlucose: 0,
    recentAvgGlucose: 0,
  });

  const loadProfile = useCallback(async () => {
    try {
      const [dashboard, profile, signupProfile, surveyAnswers] = await Promise.all([
        getMyDashboard().catch(() => null),
        getMyProfile().catch(() => null),
        getSignupProfile(),
        getSurveyAnswersFromStorage(),
      ]);

      const surveyMap = new Map(surveyAnswers.map((item) => [item.questionKey, item]));
      const dashboardBasic = dashboard?.basicInfo;
      const name =
        profile?.username?.trim() ||
        dashboard?.profile?.username?.trim() ||
        dashboardBasic?.name?.trim() ||
        signupProfile.username?.trim() ||
        FALLBACK_TEXT;
      const email =
        profile?.email?.trim() ||
        dashboardBasic?.email?.trim() ||
        signupProfile.email?.trim() ||
        FALLBACK_TEXT;
      const birthDate =
        profile?.birthDate ||
        dashboardBasic?.birthDate ||
        signupProfile.birthDate;
      const gender =
        profile?.gender ||
        dashboardBasic?.gender ||
        signupProfile.gender;
      const heightValue =
        profile?.height ??
        dashboardBasic?.height ??
        signupProfile.height;
      const weightValue =
        profile?.weight ??
        dashboardBasic?.weight ??
        signupProfile.weight;

      setBasicInfo({
        name,
        birth: formatBirthDate(birthDate),
        gender: GENDER_LABEL[gender ?? ""] ?? FALLBACK_TEXT,
        email,
        height:
          typeof heightValue === "number"
            ? formatSurveyValue({ questionKey: "HEIGHT", value: heightValue })
            : surveyMap.has("HEIGHT")
              ? formatSurveyValue(surveyMap.get("HEIGHT")!)
              : FALLBACK_TEXT,
        weight:
          typeof weightValue === "number"
            ? formatSurveyValue({ questionKey: "WEIGHT", value: weightValue })
            : surveyMap.has("WEIGHT")
              ? formatSurveyValue(surveyMap.get("WEIGHT")!)
              : FALLBACK_TEXT,
      });

      setRecordInfo({
        totalMeasurements: dashboard?.record?.totalMeasurementCount ?? 0,
        streakDays: dashboard?.record?.consecutiveMeasurementDays ?? 0,
        avgGlucose: dashboard?.record?.averageBloodSugarMgDl ?? 0,
        recentAvgGlucose: dashboard?.record?.last7DaysAverageBloodSugarMgDl ?? 0,
      });
    } catch (e: any) {
      Alert.alert(
        "마이페이지 조회 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const userName = basicInfo.name === FALLBACK_TEXT ? "유저 이름" : basicInfo.name;
  const basicInfoRows = useMemo(
    () => [
      { label: "이름", value: basicInfo.name },
      { label: "이메일", value: basicInfo.email },
      { label: "생년월일", value: basicInfo.birth },
      { label: "성별", value: basicInfo.gender },
      { label: "키", value: basicInfo.height },
      { label: "몸무게", value: basicInfo.weight },
    ],
    [basicInfo]
  );

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
                  <Text style={styles.statAccent}>{recordInfo.totalMeasurements}</Text>
                  <Text style={styles.statUnit}>회</Text>
                </Text>
              </View>
              <View style={styles.statDividerV} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>연속 측정</Text>
                <Text style={styles.statValue}>
                  <Text style={styles.statAccent}>{recordInfo.streakDays}</Text>
                  <Text style={styles.statUnit}>일</Text>
                </Text>
              </View>
            </View>

            <View style={styles.statDividerH} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>평균 혈당</Text>
              <Text style={styles.infoValueAccent}>{recordInfo.avgGlucose} mg/dL</Text>
            </View>
            <View style={[styles.infoRow, { marginTop: 10 }]}>
              <Text style={styles.infoLabel}>최근 7일 평균</Text>
              <Text style={styles.infoValueAccent}>{recordInfo.recentAvgGlucose} mg/dL</Text>
            </View>
          </View>

          {/* 기본 정보 섹션 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👤</Text>
            <Text style={styles.sectionTitle}>기본 정보</Text>
          </View>

          <View style={styles.card}>
            {basicInfoRows.map(({ label, value }, i) => (
              <View key={label}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
                {i < basicInfoRows.length - 1 && <View style={styles.statDividerH} />}
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
            colors={[Colors.light.primary, Colors.light.primaryStrong]}
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
  safe: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1, paddingHorizontal: 18 },
  scrollContent: { paddingBottom: 120 },
  contentWrapper: { marginTop: 44 },

  profileCard: {
    width: 339,
    height: 96,
    alignSelf: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 14,
    shadowColor: Colors.light.ink,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  avatar: { width: 58, height: 58, borderRadius: 999, backgroundColor: Colors.light.mutedBackground },
  profileTextArea: { marginLeft: 14, justifyContent: "center" },
  userName: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  myInfoLink: { marginTop: 6, fontSize: 12, fontWeight: "500", color: Colors.light.subtleText },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: Colors.light.text },

  card: {
    width: 339,
    alignSelf: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: Colors.light.ink,
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
  statLabel: { fontSize: 12, fontWeight: "600", color: Colors.light.subtleText, marginBottom: 6 },
  statValue: { fontSize: 16 },
  statAccent: { fontSize: 22, fontWeight: "800", color: Colors.light.primaryStrong },
  statUnit: { fontSize: 13, fontWeight: "600", color: Colors.light.subtleText },
  statDividerV: { width: 1, height: 40, backgroundColor: Colors.light.border },
  statDividerH: { height: 1, backgroundColor: Colors.light.border, marginVertical: 12 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { fontSize: 13, fontWeight: "600", color: Colors.light.subtleText },
  infoValue: { fontSize: 13, fontWeight: "600", color: Colors.light.text },
  infoValueAccent: { fontSize: 13, fontWeight: "700", color: Colors.light.primaryStrong },

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
    shadowColor: Colors.light.ink,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
