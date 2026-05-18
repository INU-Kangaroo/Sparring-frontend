import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RecordBoxProps = {
  title: string;
  time?: string;
  value?: string;
  onPress?: () => void;
  valueIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
};

export default function RecordBox({
  title,
  time,
  value,
  onPress,
  valueIcon = "heart",
  fullWidth = false,
}: RecordBoxProps) {
  return (
      <Pressable
      style={[styles.recordBox, fullWidth && styles.fullWidthBox]}
      onPress={onPress}
    >
      <Text style={styles.recordTitle}>{title}</Text>

      <View style={styles.recordItem}>
        <Ionicons name="time-outline" size={16} />
        <Text style={styles.recordText}>{time ?? "-"}</Text>
      </View>

      <View style={styles.recordItem}>
        <Ionicons name={valueIcon} size={16} color="#D32F2F" />
        <Text style={styles.recordText}>{value ?? "-"}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  recordBox: {
    width: "47%",
    padding: 5,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
    recordText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
});