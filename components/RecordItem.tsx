import React from "react";
import { View, Text, StyleSheet } from "react-native";

type RecordItemProps = {
  title: string;
  value: string;
  time: string;
  dotColor?: string;
};

export default function RecordItem({ title, value, time, dotColor }: RecordItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3C3C3C",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
});
