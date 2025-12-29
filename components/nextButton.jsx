import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function NextButton({ title = "다음", onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "90%",
    height: 55,
    backgroundColor: "#000",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
  },
  text: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});
