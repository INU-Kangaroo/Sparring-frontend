import { TextInput, StyleSheet } from "react-native";

export default function InputField({
  value,
  onChangeText,
  placeholder,
  secure = false,
}) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#bdbdbd"
      autoCapitalize="none"
      secureTextEntry={secure}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    marginTop: 6,
  },
});
