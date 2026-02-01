import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HomeFabProps = {
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
};

export default function HomeFab({ onPress }: HomeFabProps) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Ionicons name="home" size={22} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    bottom: 30,
    alignSelf: "center",
    width: 120,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4DA3FF",
    justifyContent: "center",
    alignItems: "center",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    // Android shadow
    elevation: 6,
  },
});
