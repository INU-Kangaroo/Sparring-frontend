import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";

type ScoreItem = {
  label: string;
  score: number;
  color: string;
};

type ScoreCardProps = {
  totalScore: number;
  comment: string;
  items: ScoreItem[];
};

export default function ScoreCard({ totalScore, comment, items }: ScoreCardProps) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>1</Text>
        </View>
        <Text style={styles.sectionTitle}>종합 점수</Text>
      </View>

      <View style={styles.card}>
        {/* 총합 점수 */}
        <View style={styles.totalScoreRow}>
          <View>
            <Text style={styles.totalScoreLabel}>이번 주 총합</Text>
            <Text style={styles.totalScoreNum}>
              {totalScore}
              <Text style={styles.totalScoreUnit}>점</Text>
            </Text>
          </View>
          <View style={styles.gaugeWrap}>
            <View style={styles.gaugeTrack}>
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.primaryStrong]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gaugeFill, { width: `${totalScore}%` }]}
              />
            </View>
            <Text style={styles.gaugeComment}>"{comment}"</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* 세부 항목 */}
        {items.map((item) => (
          <View key={item.label} style={styles.scoreItemRow}>
            <View style={styles.scoreItemLeft}>
              <View style={[styles.scoreDot, { backgroundColor: item.color }]} />
              <Text style={styles.scoreItemLabel}>{item.label}</Text>
            </View>
            <View style={styles.scoreItemRight}>
              <View style={styles.scoreBarTrack}>
                <View
                  style={[
                    styles.scoreBarFill,
                    { width: `${item.score}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
              <Text style={styles.scoreItemNum}>{item.score}점</Text>
            </View>
          </View>
        ))}
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
    //borderWidth: 1,
    //borderColor: "rgba(0,0,0,0.07)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.light.mutedBackground,
    marginVertical: 14,
  },

  totalScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  totalScoreLabel: { fontSize: 12, fontWeight: "600", color: Colors.light.subtleText, marginBottom: 4 },
  totalScoreNum: { fontSize: 32, fontWeight: "800", color: Colors.light.primary },
  totalScoreUnit: { fontSize: 18, fontWeight: "700", color: Colors.light.primary },

  gaugeWrap: { flex: 1 },
  gaugeTrack: {
    height: 10,
    backgroundColor: Colors.light.primarySurface,
    borderRadius: 999,
    overflow: "hidden",
  },
  gaugeFill: { height: "100%", borderRadius: 999 },
  gaugeComment: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.subtleText,
    textAlign: "right",
  },

  scoreItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  scoreItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 110,
  },
  scoreDot: { width: 10, height: 10, borderRadius: 999 },
  scoreItemLabel: { fontSize: 14, fontWeight: "600", color: Colors.light.text },
  scoreItemRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.mutedBackground,
    borderRadius: 999,
    overflow: "hidden",
  },
  scoreBarFill: { height: "100%", borderRadius: 999 },
  scoreItemNum: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.text,
    width: 36,
    textAlign: "right",
  },
});