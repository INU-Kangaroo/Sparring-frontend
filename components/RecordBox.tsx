import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RecordBoxProps = {
  title: string;
  time?: string;
  value?: string;
  onPress?: () => void;
};

export default function RecordBox({ title, time, value, onPress }: RecordBoxProps) {
  return (
    <Pressable style={styles.recordBox} onPress={onPress}>
      <Text style={styles.recordTitle}>{title}</Text>

      <View style={styles.recordItem}>
        <Ionicons name="time-outline" size={16} />
        <Text>{time ?? "-"}</Text>
      </View>

      <View style={styles.recordItem}>
        <Ionicons name="heart" size={16} color="#D32F2F" />
        <Text>{value ?? "-"}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  recordBox: {
    width: "47%",
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
  hint: {
  fontSize: 11,
  color: "#999",
  marginTop: 4,
  },

});
