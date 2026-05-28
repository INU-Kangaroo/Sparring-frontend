import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

type RecommendationHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
  onRefresh: () => void;
  refreshing: boolean;
};

export default function RecommendationHeader({
  title,
  subtitle,
  onBack,
  onRefresh,
  refreshing,
}: RecommendationHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
        </View>

        <Pressable onPress={onRefresh} style={styles.refreshButton} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={Colors.light.primaryStrong} />
          ) : (
            <Ionicons name="refresh" size={20} color={Colors.light.primaryStrong} />
          )}
        </Pressable>
      </View>

      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(217, 145, 151, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 20,
    fontSize: 15,
    color: Colors.light.subtleText,
  },
});
