import type { Dispatch, SetStateAction } from "react";
import { View, TextInput, StyleSheet, Keyboard } from "react-native";
import { useRef } from "react";

type CodeInputProps = {
  code: string[];
  setCode: Dispatch<SetStateAction<string[]>>;
};

export default function CodeInput({ code, setCode }: CodeInputProps) {
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // 다음 칸으로 이동
    if (text && index < code.length - 1) {
      inputs.current[index + 1]?.focus();
    }

    // 전부 입력되면 키보드 내림 (선택)
    if (newCode.every((v) => v !== "")) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // 백스페이스 시 이전 칸으로 이동
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((value, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputs.current[index] = ref;
          }}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          value={value}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          returnKeyType="done"
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