import React from "react";
import { View, Text, StyleSheet } from "react-native";

type ImprovementItem = {
  id: string;
  icon: string;
  problem: string;
  detail: string;
  dayDetails: string;
  tips: string[];
};

type WarningsListProps = {
  items: ImprovementItem[];
};

export default function WarningsList({ items }: WarningsListProps) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>!</Text>
        </View>
        <Text style={styles.sectionTitle}>개선이 필요해요</Text>
      </View>

      {items.map((item) => (
        <View key={item.id} style={[styles.card, items.indexOf(item) > 0 && { marginTop: 12 }]}>
          {/* 문제 항목 */}
          <View style={styles.improveHeader}>
            <Text style={styles.improveIcon}>{item.icon}</Text>
            <Text style={styles.improveProblem}>{item.problem}</Text>
          </View>
          <Text style={styles.improveDetail}>{item.detail}</Text>
          <Text style={styles.improveDayDetail}>{item.dayDetails}</Text>

          <View style={styles.cardDivider} />

          {/* 개선 방법 */}
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsIcon}>💡</Text>
            <Text style={styles.tipsTitle}>개선 방법</Text>
          </View>
          {item.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipNumBadge}>
                <Text style={styles.tipNum}>{i + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      ))}
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
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: { fontSize: 12, fontWeight: "800", color: "#fff" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 14,
  },

  improveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  improveIcon: { fontSize: 18 },
  improveProblem: { fontSize: 16, fontWeight: "800", color: "#111" },
  improveDetail: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    lineHeight: 20,
  },
  improveDayDetail: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },

  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  tipsIcon: { fontSize: 16 },
  tipsTitle: { fontSize: 14, fontWeight: "800", color: "#333" },

  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  tipNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  tipNum: { fontSize: 11, fontWeight: "800", color: "#FF6B6B" },
  tipText: { fontSize: 14, fontWeight: "600", color: "#333" },
});
