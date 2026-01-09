import { TextInput, KeyboardTypeOptions } from "react-native";

type InputFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secure?: boolean;
};

export default function InputField({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secure = false,
}: InputFieldProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      secureTextEntry={secure}
    />
  );
}
