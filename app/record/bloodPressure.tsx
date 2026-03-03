import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";

import HomeFab from "../../components/HomeButton";
import RecordBox from "../../components/RecordBox";
import PressureInput from "../../components/PressureInput";
import InfoModal from "../../components/InfoModal";

import {
  createBloodPressureLog,
  getBloodPressureDaily,
} from "../api/bloodPressure";

const screenWidth = Dimensions.get("window").width;

type BloodPressure = {
  systolic: number;
  diastolic: number;
  heartRate?: number;
  measuredAt: Date;
  measurementLabel?: string;
};

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;

const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function normalizeDaily(raw: any): BloodPressure[] {
  const arr = Array.isArray(raw) ? raw : raw?.data ?? raw?.logs ?? [];
  if (!Array.isArray(arr)) return [];

  return arr
    .map((it: any) => {
      if (!it?.measuredAt) return null;

      return {
        systolic: Number(it.systolic),
        diastolic: Number(it.diastolic),
        heartRate:
          it.heartRate != null ? Number(it.heartRate) : undefined,
        measuredAt: new Date(it.measuredAt),
        measurementLabel: it.measurementLabel,
      };
    })
    .filter(Boolean) as BloodPressure[];
}

export default function BloodPressureScreen() {
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [morningBP, setMorningBP] = useState<BloodPressure | null>(null);
  const [nightBP, setNightBP] = useState<BloodPressure | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [inputVisible, setInputVisible] = useState(false);
  const [editing, setEditing] = useState<"morning" | "night">("morning");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const fetchDaily = async () => {
    try {
      setLoading(true);

      const raw = await getBloodPressureDaily(toYmd(date));
      const records = normalizeDaily(raw);

      const morning =
        records.find((r) =>
          r.measurementLabel?.includes("아침")
        ) ?? null;

      const night =
        records.find(
          (r) =>
            r.measurementLabel?.includes("취침") ||
            r.measurementLabel?.includes("밤") ||
            r.measurementLabel?.includes("저녁")
        ) ?? null;

      setMorningBP(morning);
      setNightBP(night);
    } catch (e: any) {
      Alert.alert(
        "불러오기 실패",
        e?.message ?? "혈압 기록 조회 실패"
      );
      setMorningBP(null);
      setNightBP(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, [date]);

  const inputTitle =
    editing === "morning"
      ? "아침 혈압 입력"
      : "취침 전 혈압 입력";

  const initialValue = useMemo<[number, number] | undefined>(() => {
    const bp =
      editing === "morning" ? morningBP : nightBP;
    return bp ? [bp.systolic, bp.diastolic] : undefined;
  }, [editing, morningBP, nightBP]);

  const initialMeasuredAt = useMemo<Date | undefined>(() => {
    const bp =
      editing === "morning" ? morningBP : nightBP;
    return bp?.measuredAt;
  }, [editing, morningBP, nightBP]);

  const systolicData = [
    morningBP?.systolic ?? 0,
    nightBP?.systolic ?? 0,
  ];
  const diastolicData = [
    morningBP?.diastolic ?? 0,
    nightBP?.diastolic ?? 0,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>혈압 기록</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Pressable
          style={styles.datePill}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons
            name="calendar"
            size={14}
            color="#fff"
          />
          <Text style={styles.dateText}>
            {date.toLocaleDateString()}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        {loading && <ActivityIndicator />}

        <View style={styles.recordRow}>
          <RecordBox
            title="아침 혈압"
            time={
              morningBP
                ? formatTime(morningBP.measuredAt)
                : undefined
            }
            value={
              morningBP
                ? `${morningBP.systolic}/${morningBP.diastolic}`
                : undefined
            }
            onPress={() => {
              setEditing("morning");
              setInputVisible(true);
            }}
          />

          <RecordBox
            title="취침 전 혈압"
            time={
              nightBP
                ? formatTime(nightBP.measuredAt)
                : undefined
            }
            value={
              nightBP
                ? `${nightBP.systolic}/${nightBP.diastolic}`
                : undefined
            }
            onPress={() => {
              setEditing("night");
              setInputVisible(true);
            }}
          />
        </View>

        <LineChart
          data={{
            labels: ["아침", "취침 전"],
            datasets: [
              {
                data: systolicData,
                color: () => "red",
              },
              {
                data: diastolicData,
                color: () => "blue",
              },
            ],
            legend: ["수축기", "이완기"],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="mmHg"
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: () => "#000",
            labelColor: () => "#333",
          }}
        />
      </ScrollView>

      <PressureInput
        visible={inputVisible}
        title={inputTitle}
        initialValue={initialValue}
        initialMeasuredAt={initialMeasuredAt}
        onClose={() => setInputVisible(false)}
        onSubmit={async (s, d, measuredAt) => {
          try {
            setSaving(true);

            const merged = new Date(date);
            merged.setHours(
              measuredAt.getHours(),
              measuredAt.getMinutes(),
              0,
              0
            );

            await createBloodPressureLog({
              systolic: s,
              diastolic: d,
              measuredAt: merged.toISOString(),
              measurementLabel:
                editing === "morning"
                  ? "아침"
                  : "취침 전",
            });

            setInputVisible(false);
            await fetchDaily();
          } catch (e: any) {
            Alert.alert(
              "저장 실패",
              e?.message ?? "저장 실패"
            );
          } finally {
            setSaving(false);
          }
        }}
      />

      <InfoModal
        visible={modalVisible}
        title={modalTitle}
        content={modalContent}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    height: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerTitle: { fontWeight: "700" },
  container: { padding: 20 },
  datePill: {
    flexDirection: "row",
    backgroundColor: "#3C3C3C",
    padding: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  dateText: { color: "#fff", marginLeft: 6 },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
});