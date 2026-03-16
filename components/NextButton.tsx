import { TouchableOpacity, Text, StyleSheet } from "react-native";

type NextButtonProps = {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function NextButton({
  title = "다음",
  onPress,
  disabled = false,
}: NextButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "90%",
    height: 55,
    backgroundColor: "#1435b9f6",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  text: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});