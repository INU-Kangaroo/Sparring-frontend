import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import NextButton from "../../components/NextButton";


export default function EmailLogin() {
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const router = useRouter();

  const nextPage = () => {
    if (!gender) return; // 선택 안 하면 못 넘어가게
    router.push("/sign-up/birthdate");
  }; 

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>

        <Text style={styles.heading}>나의 건강 시그널을 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>3초만에 회원가입!</Text>

        <Text style={styles.subtext}>성별을 입력해주세요</Text>

        <View style={{ flexDirection: "row", alignSelf: "flex-start" }}>
          <Text style={styles.subtext2}>성별</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.genderRow}>
          <Pressable
            onPress={() => setGender("male")}
            style={[styles.card, gender === "male" && styles.selectedCard]}
          >
            <Text
              style={[
                styles.cardText,
                gender === "male" && styles.selectedText,
              ]}
            >
              남성
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setGender("female")}
            style={[styles.card, gender === "female" && styles.selectedCard]}
          >
            <Text
              style={[
                styles.cardText,
                gender === "female" && styles.selectedText,
              ]}
            >
              여성
            </Text>
          </Pressable>
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
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  card: {
    width: "48%",
    height: 140,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCard: {
    borderColor: "#111",
    backgroundColor: "#f5f5f5",
  },
  cardText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  selectedText: {
    color: "#111",
    fontWeight: "600",
  },
});
