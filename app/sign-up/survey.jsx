import { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/backButton";
import NextButton from "../../components/nextButton";

const Chip = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
      {label}
    </Text>
  </Pressable>
);

export default function Survey() {
  const router = useRouter();

  const [bloodSugar, setBloodSugar] = useState(null);
  const [bloodPressure, setBloodPressure] = useState(null);
  const [medication, setMedication] = useState("");
  const [allergy, setAllergy] = useState("");
  const [goal, setGoal] = useState("");
  const [familyHistory, setFamilyHistory] = useState(null);

  const handleNext = () => {
    if (
      !bloodSugar ||
      !bloodPressure ||
      !medication ||
      !allergy ||
      !goal ||
      familyHistory === null
    )
      return;

    router.push("/sign-up/complete"); // 다음 단계
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>3초만에 회원가입!</Text>

        <Text style={styles.subtext}>당신의 건강 상태에 대해 알려주세요</Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}>혈당 상태</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.chipRow}>
          {["정상", "경계성", "제1형", "제2형", "모름"].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={bloodSugar === item}
              onPress={() => setBloodSugar(item)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>혈압 상태</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.chipRow}>
          {["정상", "경계성", "1차고혈압", "2차고혈압", "모름"].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={bloodPressure === item}
              onPress={() => setBloodPressure(item)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>복용 중인 약물</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="자유롭게 서술하세요"
          value={medication}
          onChangeText={setMedication}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>알레르기 음식</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="자유롭게 서술하세요"
          value={allergy}
          onChangeText={setAllergy}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>주요 건강 목표</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="자유롭게 서술하세요"
          value={goal}
          onChangeText={setGoal}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>가족원 중 고혈압 유무</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.chipRow}>
          {["예", "아니오"].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={familyHistory === item}
              onPress={() => setFamilyHistory(item)}
            />
          ))}
        </View>

        <View style={{ marginTop: 40 }}>
          <NextButton title="다음" onPress={handleNext} />
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  heading: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  heading2: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  subtext: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",

    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },
  star: {
    fontSize: 13,
    color: "#e53935",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 13,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#747474ff",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: "#373636ff",
  },
  chipText: {
    color: "#fff",
    fontSize: 14,
  },
  chipTextSelected: {
    fontWeight: "600",
  },
  input: {
    marginTop: 14,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
  },
});
