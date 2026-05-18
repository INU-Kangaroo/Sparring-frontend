import { TextInput, KeyboardTypeOptions } from "react-native";

type InputFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secure?: boolean;
  returnKeyType?: "done" | "next";
  onSubmitEditing?: () => void;
};

export default function InputField({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secure = false,
  returnKeyType,
  onSubmitEditing,
}: InputFieldProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      secureTextEntry={secure}
       returnKeyType={returnKeyType}        
      onSubmitEditing={onSubmitEditing}     
    />
  );
}
