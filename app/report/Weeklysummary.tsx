import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ActivitySummary, Highlight } from "../api/insights";
import Colors from "@/constants/Colors";

type DayData = {
  day: string;
  emoji: string;
  count: number;
};

type WeeklySummaryProps = {
  totalMeasured: number;
  totalPossible: number;
  avgGlucose: number;
  normalCount: number;
  normalTotal: number;
  dayData: DayData[];
  highlights: Highlight[];
  activitySummary?: ActivitySummary;
};

export default function WeeklySummary({
  totalMeasured,
  totalPossible,
  avgGlucose,
  normalCount,
  normalTotal,
  dayData,
  highlights,
  activitySummary,
}: WeeklySummaryProps) {
  const measurePct =
    totalPossible > 0
      ? Math.min(100, Math.round((totalMeasured / totalPossible) * 100))
      : 0;
  const normalPct =
    normalTotal > 0 ? Math.round((normalCount / normalTotal) * 100) : 0;
  const averageSteps = activitySummary?.averageSteps;
  const postMealActivityDays = activitySummary?.postMealActivityDays;
  const postMealActivityTargetDays = activitySummary?.postMealActivityTargetDays;
  const postMealActivityRate =
    activitySummary?.postMealActivityRate ??
    (postMealActivityDays != null &&
    postMealActivityTargetDays != null &&
    postMealActivityTargetDays > 0
      ? Math.round((postMealActivityDays / postMealActivityTargetDays) * 100)
      : null);

  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>2</Text>
        </View>
        <Text style={styles.sectionTitle}>이번 주 요약</Text>
      </View>

      <View style={styles.card}>
        {/* 총 측정 */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>총 측정</Text>
          <Text style={styles.statValue}>
            <Text style={styles.statAccent}>{totalMeasured}회</Text>
            <Text style={styles.statGray}> / {totalPossible}회</Text>
          </Text>
        </View>
        <View style={styles.gaugeTrack}>
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.primaryStrong]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gaugeFill, { width: `${measurePct}%` }]}
          />
        </View>
        <Text style={styles.gaugePct}>{measurePct}%</Text>

        <View style={styles.cardDivider} />

        {/* 평균 혈당 / 정상 범위 */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>평균 혈당</Text>
          <Text style={styles.statValue}>
            <Text style={styles.statAccent}>{avgGlucose}</Text>
            <Text style={styles.statGray}> mg/dL</Text>
          </Text>
        </View>
        <View style={[styles.statRow, { marginTop: 8 }]}>
          <Text style={styles.statLabel}>정상 범위</Text>
          <Text style={styles.statValue}>
            <Text style={styles.statAccent}>{normalCount}/{normalTotal}회</Text>
            <Text style={styles.statGray}> ({normalPct}%)</Text>
          </Text>
        </View>

        {(averageSteps != null || postMealActivityDays != null) && (
          <>
            <View style={styles.cardDivider} />
            <View style={styles.activityGrid}>
              <View style={styles.activityCard}>
                <Text style={styles.activityLabel}>평균 걸음수</Text>
                <Text style={styles.activityValue}>
                  {averageSteps != null ? `${averageSteps.toLocaleString()}보` : "-"}
                </Text>
              </View>
              <View style={styles.activityCard}>
                <Text style={styles.activityLabel}>식후 활동 실천</Text>
                <Text style={styles.activityValue}>
                  {postMealActivityDays != null && postMealActivityTargetDays != null
                    ? `${postMealActivityDays}/${postMealActivityTargetDays}일`
                    : "-"}
                </Text>
                {postMealActivityRate != null ? (
                  <Text style={styles.activitySub}>{postMealActivityRate}%</Text>
                ) : null}
              </View>
            </View>
          </>
        )}

        <View style={styles.cardDivider} />

        <View style={styles.dayRow}>
          {dayData.map((d) => (
            <View key={d.day} style={styles.dayCol}>
              <Text style={styles.dayLabel}>{d.day}</Text>
              <Text style={styles.dayEmoji}>{d.emoji}</Text>
              <Text style={styles.dayCount}>{d.count}회</Text>
            </View>
          ))}
        </View>

        {highlights.length > 0 && (
          <>
            <View style={styles.cardDivider} />
            <View style={styles.highlightsWrap}>
              {highlights.map((item, index) => (
                <View
                  key={`${item.type}-${item.message}-${index}`}
                  style={styles.highlightRow}
                >
                  <Text style={styles.highlightIcon}>
                    {item.type === "GOOD" ? "✅" : "⚠️"}
                  </Text>
                  <Text style={styles.highlightText}>{item.message}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: { marginTop: 28 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: { fontSize: 12, fontWeight: "800", color: Colors.light.card },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: Colors.light.text },

  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: Colors.light.ink,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.light.mutedBackground,
    marginVertical: 14,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: { fontSize: 14, fontWeight: "600", color: Colors.light.subtleText },
  statValue: { fontSize: 14 },
  statAccent: { fontWeight: "700", color: Colors.light.primaryStrong },
  statGray: { fontWeight: "600", color: Colors.light.subtleText },

  gaugeTrack: {
    height: 8,
    backgroundColor: Colors.light.primarySurface,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 4,
  },
  gaugeFill: { height: "100%", borderRadius: 999 },
  gaugePct: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.primaryStrong,
    textAlign: "right",
    marginBottom: 4,
  },
  activityGrid: {
    flexDirection: "row",
    gap: 10,
  },
  activityCard: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.primarySurfaceStrong,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.subtleText,
    marginBottom: 6,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.light.primaryStrong,
  },
  activitySub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.subtleText,
  },

  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCol: { alignItems: "center", gap: 4 },
  dayLabel: { fontSize: 12, fontWeight: "600", color: Colors.light.subtleText },
  dayEmoji: { fontSize: 20 },
  dayCount: { fontSize: 11, fontWeight: "600", color: Colors.light.text },

  highlightsWrap: { gap: 12 },
  highlightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  highlightIcon: {
    fontSize: 16,
    lineHeight: 22,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    lineHeight: 22,
  },
});