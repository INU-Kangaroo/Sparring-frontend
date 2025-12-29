import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BackButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 10 }}>
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
  );
}
