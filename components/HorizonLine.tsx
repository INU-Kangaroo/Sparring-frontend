import React from "react";
import { View, Text, StyleSheet } from "react-native";

type HorizonLineProps = {
  text?: string;
};

const HorizonLine = ({ text }: HorizonLineProps) => {
  // text 없으면 그냥 한 줄
  if (!text) {
    return <View style={styles.singleLine} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.line} />

      <Text style={styles.text}>
        {text}
      </Text>

      <View style={styles.line} />
    </View>
  );
};

export default HorizonLine;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DADADA",
  },

  singleLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#DADADA",
    marginVertical: 10,
  },

  text: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    backgroundColor: "#F5F5F5",
  },
});