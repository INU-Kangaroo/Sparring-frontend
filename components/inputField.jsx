import { TextInput, StyleSheet } from "react-native";

export default function InputField({ value, onChangeText, placeholder }) {
  return (
    <TextInput
      label="이메일"
      placeholder="email@example.com"
      placeholderTextColor="#9E9E9E" 
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      keyboardType="email-address"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: 290,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
});
