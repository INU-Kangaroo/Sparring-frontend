import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type HomeFabProps = {
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
};

export default function HomeFab({ onPress }: HomeFabProps) {
  return (
    <Pressable style={styles.fabWrap} onPress={onPress}>
      <LinearGradient
        colors={["#1D4BFF", "#1D4BFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fab}
      >
        <Ionicons name="home" size={22} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    bottom: 30,
    alignSelf: "center",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    // Android shadow
    elevation: 6,
    borderRadius: 24,
  },
  fab: {
    width: 120,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});