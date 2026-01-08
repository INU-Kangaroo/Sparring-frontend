import { TouchableOpacity } from "react-native";

export default function header({  }) {
  return (
    <TouchableOpacity onPress={onPress} >
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
  );
}
