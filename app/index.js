import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>홈 화면</Text>

      <TouchableOpacity onPress={() => router.push("/sign-up/email")}>
        <Text style={{ marginTop: 20, fontSize: 18 }}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}
