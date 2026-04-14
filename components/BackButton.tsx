import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

type BackButtonProps = {
  onPress: () => void;
};

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
    </TouchableOpacity>
  );
}
