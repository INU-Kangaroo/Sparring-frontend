import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
      style={[styles.buttonWrap, disabled && styles.disabledWrap]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {disabled ? (
        <LinearGradient
          colors={["#8C8C8C", "#8C8C8C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={["#D99197", "#D99197"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonWrap: {
    width: "100%",
    alignSelf: "center",
    marginBottom: 30,
    borderRadius: 15,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  disabledWrap: {
    opacity: 0.9,
  },
  button: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});