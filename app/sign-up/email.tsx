import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import InputField from "../../components/InputField";
import NextButton from "../../components/NextButton";

export default function EmailLogin() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSend = () => {
    if (!email) return;

    router.push("/login/verify");
  };

  const nextPage = () => {
    router.push("/sign-up/verify");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>

        <Text style={styles.heading}>나의 건강 시그널을 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>3초만에 회원가입!</Text>

        <Text style={styles.subtext}>이메일을 입력해주세요.</Text>
        <View style={{ flexDirection: "row", alignSelf: "flex-start" }}>
        <Text style={styles.subtext2}>이메일</Text>
        <Text style={styles.star}> *</Text>
      </View>


        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="inu@inu.ac.kr"
        />
      </View>


      <View style={{ marginBottom: 20, width: "100%" }}>
        <NextButton title="다음" onPress={nextPage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    paddingHorizontal: 1,
  },
  heading: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "600",
    color: "#1e1d1dff",
  },
  heading2: {
    marginTop: 5,
    fontSize: 20,
    alignSelf: "flex-start",
    fontWeight: "600",
    color: "#1e1d1dff",
  },
  subtext: {
    marginTop: 70,
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "500",
    color: "#1e1d1dff",
  },
  subtext2: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#1e1d1dff",
    marginVertical: 10,
  },
    star: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#fa1212ff",
    marginVertical: 10,
  },
});
