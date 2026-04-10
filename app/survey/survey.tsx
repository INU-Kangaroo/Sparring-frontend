import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import NextButton from "../../components/NextButton";
import { useSurveyDraft } from "./surveyContext";
import SignupProgress from "@/components/SignupProgress";

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const Chip = ({ label, selected, onPress }: ChipProps) => (
  <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
);

const mapBloodSugar = (v: string) => {
  switch (v) {
    case "정상":
      return "NORMAL";
    case "경계성":
      return "BORDERLINE";
    case "제1형":
      return "TYPE1";
    case "제2형":
      return "TYPE2";
    default:
      return "UNKNOWN";
  }
};

const mapBloodPressure = (v: string) => {
  switch (v) {
    case "정상":
      return "NORMAL";
    case "경계성":
      return "BORDERLINE";
    case "1차고혈압":
      return "STAGE1";
    case "2차고혈압":
      return "STAGE2";
    default:
      return "UNKNOWN";
  }
};

export default function Survey() {
  const router = useRouter();
  const { setAnswer } = useSurveyDraft();

  const [bloodSugar, setBloodSugar] = useState<string | null>(null);
  const [bloodPressure, setBloodPressure] = useState<string | null>(null);
  const [familyHistory, setFamilyHistory] = useState<string | null>(null);
  const [medication, setMedication] = useState("");
  const [allergy, setAllergy] = useState("");
  const [goal, setGoal] = useState("");

  const handleNext = () => {
    if (
      !bloodSugar ||
      !bloodPressure ||
      !medication.trim() ||
      !allergy.trim() ||
      !goal.trim() ||
      familyHistory === null
    ) {
      Alert.alert("입력 누락", "필수 항목을 모두 입력해주세요.");
      return;
    }

    setAnswer("BLOOD_SUGAR_STATUS", mapBloodSugar(bloodSugar));
    setAnswer("BLOOD_PRESSURE_STATUS", mapBloodPressure(bloodPressure));
    setAnswer("MEDICATIONS", medication.trim());
    setAnswer("ALLERGIES", allergy.trim());
    setAnswer("HEALTH_GOAL", goal.trim());
    setAnswer("HAS_FAMILY_HYPERTENSION", familyHistory === "예");

    router.push("/survey/survey1");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <BackButton onPress={() => router.back()} />
            <SignupProgress step={1} />
        </View>

        <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>건강 상태 알려주세요</Text>

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
  header: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 1 },
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
    marginTop: 26,
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
    gap: 5,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#8C8C8C",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: "#262626",
  },
  chipText: {
    color: "#fff",
    fontSize: 14,
  },
  chipTextSelected: {
    fontWeight: "700",
  },
  input: {
    marginTop: 10,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111",
  },
});