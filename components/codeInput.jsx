import { View, TextInput, StyleSheet } from "react-native";

export default function codeInput({ code, setCode }) {
  const handleChange = (text, index) => {
    if (!/^\d?$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
  };

  return (
    <View style={styles.container}>
      {code.map((value, index) => (
        <TextInput
          key={index}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          value={value}
          onChangeText={(text) => handleChange(text, index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    gap: 7,
  },
  input: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
  },
});
