import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";

type RecommendationCardProps = {
  isActive: boolean;
  onPress: () => void;
  title: string;
  rightText?: string;
  subText?: string;
  subText2?: string;
};

export default function RecommendationCard({
  isActive,
  onPress,
  title,
  rightText,
  subText,
  subText2,
}: RecommendationCardProps) {
  const titleNode = <Text style={isActive ? styles.titleActive : styles.title}>{title}</Text>;
  const rightNode = rightText ? (
    <Text style={isActive ? styles.rightActive : styles.right}>{rightText}</Text>
  ) : null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      {isActive ? (
        <LinearGradient
          colors={["rgba(217,145,151,0.8)", "rgba(217,145,151,0.8)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeContainer}
        >
          <View style={styles.row}>
            {titleNode}
            {rightNode}
          </View>
          {subText ? <Text style={styles.subActive}>{subText}</Text> : null}
          {subText2 ? <Text style={styles.subActive}>{subText2}</Text> : null}
        </LinearGradient>
      ) : (
        <View style={styles.inactiveContainer}>
          <View style={styles.row}>
            {titleNode}
            {rightNode}
          </View>
          {subText ? <Text style={styles.sub}>{subText}</Text> : null}
          {subText2 ? <Text style={styles.sub}>{subText2}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeContainer: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: Colors.light.primaryStrong,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  inactiveContainer: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleActive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    lineHeight: 22,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    lineHeight: 22,
  },
  rightActive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
    marginLeft: 12,
  },
  right: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    flexShrink: 0,
    marginLeft: 12,
  },
  subActive: {
    marginTop: 5,
    fontSize: 12,
    color: "rgba(255,255,255,0.82)",
  },
  sub: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },
});
