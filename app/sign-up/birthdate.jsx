import { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/backButton"
import NextButton from "../../components/nextButton";

export default function Birthdate() {
  const router = useRouter();

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const nextPage = () => {
    if (!year || !month || !day) return;
    router.push("/sign-up/stats"); // 다음 경로로 수정
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>

        <Text style={styles.heading}>나의 건강 시그널을 확인하고 싶다면?</Text>
        <Text style22={styles.heading2}>3초만에 회원가입!</Text>

        <Text style={styles.subtext}>생년 월일을 입력해주세요</Text>

        <View style={styles.labelRow}>
          <Text style={styles.subtext2}>생년월일</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.dateRow}>
          <TextInput
            style={styles.input}
            placeholder="Year"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            onChangeText={setYear}
          />

          <TextInput
            style={styles.input}
            placeholder="Month"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
            maxLength={2}
            value={month}
            onChangeText={setMonth}
          />

          <TextInput
            style={styles.input}
            placeholder="DAY"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
            maxLength={2}
            value={day}
            onChangeText={setDay}
          />
        </View>

        <View style={{ marginTop: "auto", width: "100%", marginBottom: 20 }}>
          <NextButton title="다음" onPress={nextPage} />
        </View>
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
    fontWeight: "600",
    color: "#1e1d1dff",
  },
  subtext: {
    marginTop: 70,
    fontSize: 16,
    fontWeight: "500",
    color: "#1e1d1dff",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  subtext2: {
    fontSize: 12,
    color: "#1e1d1dff",
  },
  star: {
    fontSize: 12,
    color: "#fa1212ff",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  input: {
    width: "30%",
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    textAlign: "center",
    fontSize: 16,
    color: "#111",
  },
});


