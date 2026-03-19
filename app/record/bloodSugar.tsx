import React, { useEffect, useMemo, useState, Fragment } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";

import HomeFab from "../../components/HomeButton";
import InfoModal from "../../components/InfoModal";
import BloodInputModal from "../../components/BloodInput";
import BackButton from "@/components/BackButton";
import RecordBox from "../../components/RecordBox";
import { createBloodSugarLog, getBloodSugarDaily } from "../api/bloodSugar";
import HorizonLine from "../../components/HorizonLine";

// -------- date utils --------
const pad2 = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toHm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const formatTime = (d: Date) => toHm(d);
// ----------------------------

const screenWidth = Dimensions.get("window").width;

type BloodRecordUI = {
  glucoseLevel: number;
  measuredAt: Date;
  measurementLabel: string;
};

function normalizeDaily(raw: any): BloodRecordUI[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw?.logs ?? raw?.data ?? raw?.items ?? [];
  if (!Array.isArray(arr)) return [];

  return arr
    .map((it: any) => {
      const glucose = Number(
        it?.glucoseLevel ?? it?.value ?? it?.bloodSugar ?? it?.glucose
      );
      const measuredAtStr =
        it?.measuredAt ?? it?.measured_at ?? it?.timestamp ?? it?.createdAt;
      const label = String(
        it?.measurementLabel ?? it?.label ?? it?.title ?? ""
      );

      if (!Number.isFinite(glucose)) return null;
      if (!measuredAtStr) return null;

      return {
        glucoseLevel: glucose,
        measuredAt: new Date(measuredAtStr),
        measurementLabel: label,
      } as BloodRecordUI;
    })
    .filter(Boolean) as BloodRecordUI[];
}

export default function BloodSugarScreen() {
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const selectedYmd = useMemo(() => toYmd(date), [date]);

  const [records, setRecords] = useState<BloodRecordUI[]>([]);
  const [inputVisible, setInputVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const [chartWidth, setChartWidth] = useState<number>(screenWidth - 36);

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const raw = await getBloodSugarDaily(selectedYmd);
      const list = normalizeDaily(raw).sort(
        (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime()
      );
      setRecords(list);
    } catch (e: any) {
      console.log(
        "bloodSugar fetchDaily error",
        e?.response?.status,
        e?.response?.data ?? e
      );
      Alert.alert("불러오기 실패", e?.message ?? "혈당 기록을 불러오지 못했어요.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, [selectedYmd]);

  const chart = useMemo(() => {
    const labels = records.map((r) => formatTime(r.measuredAt));
    const values = records.map((r) => r.glucoseLevel);

    const maxLabels = 6;
    let thinnedLabels = labels;

    if (labels.length > maxLabels) {
      const step = Math.ceil(labels.length / maxLabels);
      thinnedLabels = labels.map((t, i) => (i % step === 0 ? t : ""));
    }

    return {
      labels: thinnedLabels.length ? thinnedLabels : ["-"],
      values: values.length ? values : [0],
    };
  }, [records]);

  const displayTitle = (r: BloodRecordUI) => r.measurementLabel || "혈당";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton onPress={() => router.replace("/main/main")} />
        <Text style={styles.headerTitle}>기록하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.dateRow}>
          <Pressable
            style={({ pressed }) => [
              styles.datePillWrap,
              pressed && styles.pressedBtn,
            ]}
            onPress={() => setShowDatePicker((prev) => !prev)}
          >
            <LinearGradient
              colors={["#0D99FF", "#1D4BFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.datePill}
            >
              <Ionicons name="calendar" size={14} color="#fff" />
              <Text style={styles.dateText}>{selectedYmd}</Text>
            </LinearGradient>
          </Pressable>

          {showDatePicker && (
            <View style={styles.datePickerInline}>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "compact" : "default"}
                onChange={(event, selected) => {
                  if ((event as any)?.type === "dismissed") {
                    setShowDatePicker(false);
                    return;
                  }

                  if (selected) {
                    setDate(selected);
                  }

                  if (Platform.OS !== "ios") {
                    setShowDatePicker(false);
                  }
                }}
              />
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>혈당 기록</Text>

        {loading && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        )}

        <View style={{ marginTop: 6 }}>
          {!loading && records.length === 0 ? (
            <Text style={styles.emptyText}>
              아직 기록이 없어요. 아래 ＋ 버튼으로 추가해줘!
            </Text>
          ) : (
            records.map((r, idx) => (
              <Fragment key={`${r.measuredAt.toISOString()}-${idx}`}>
                <RecordBox
                  title={displayTitle(r)}
                  time={formatTime(r.measuredAt)}
                  value={`${r.glucoseLevel} mg/dL`}
                  fullWidth
                  valueIcon="water"
                />
                {idx !== records.length - 1 && (
                  <View style={styles.recordDivider} />
                )}
              </Fragment>
            ))
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addBarWrap,
            saving && { opacity: 0.7 },
            pressed && styles.pressedBtn,
          ]}
          onPress={() => setInputVisible(true)}
          disabled={saving}
        >
          <LinearGradient
            colors={["#0D99FF", "#1D4BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addBar}
          >
            <Text style={styles.addPlus}>＋</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [
              styles.darkBtnWrap,
              pressed && styles.pressedBtn,
            ]}
            onPress={() => {
              setModalTitle("혈당 측정 방법");
              setModalContent(
                "1. 손을 깨끗이 씻고 말립니다.\n\n" +
                  "2. 테스트 스트립을 측정기에 삽입합니다.\n\n" +
                  "3. 채혈기로 손가락 끝을 살짝 찔러 혈액을 채취합니다.\n\n" +
                  "4. 혈액을 테스트 스트립에 묻힙니다.\n\n" +
                  "5. 결과를 기록합니다."
              );
              setModalVisible(true);
            }}
          >
            <LinearGradient
              colors={["#0D99FF", "#1D4BFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.darkBtn}
            >
              <Text style={styles.darkBtnText}>혈당 측정 방법</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.darkBtnWrap,
              pressed && styles.pressedBtn,
            ]}
            onPress={() => {
              setModalTitle("혈당 정상 수치");
              setModalContent(
                "✔ 공복 혈당: 70-99 mg/dL\n\n✔ 식후 2시간 혈당: 140 mg/dL 미만"
              );
              setModalVisible(true);
            }}
          >
            <LinearGradient
              colors={["#0D99FF", "#1D4BFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.darkBtn}
            >
              <Text style={styles.darkBtnText}>혈당 정상 수치</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHead}>
            <Text style={styles.cardTitle}>혈당 추세</Text>
            <Text style={styles.smallText}>단위: mg/dL</Text>
          </View>

          <View
            style={styles.chartWrap}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w && Math.abs(w - chartWidth) > 1) setChartWidth(w);
            }}
          >
            <LineChart
              data={{
                labels: chart.labels,
                datasets: [{ data: chart.values, color: () => "#d30c0c" }],
              }}
              width={chartWidth}
              height={180}
              fromZero
              withInnerLines
              withOuterLines={false}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => "#3C3C3C",
                labelColor: () => "#666",
                propsForDots: { r: "3" },
              }}
              style={{ borderRadius: 14 }}
            />
          </View>
        </View>
      </ScrollView>

      <HomeFab onPress={() => router.push("/main/main")} />

      <InfoModal
        visible={modalVisible}
        title={modalTitle}
        content={modalContent}
        onClose={() => setModalVisible(false)}
      />

      <BloodInputModal
        visible={inputVisible}
        onClose={() => setInputVisible(false)}
        onSubmit={async ({ title, value, measuredAt }) => {
          const measurementLabel = title?.trim() || "공복";
          const measurementDate = toYmd(date);
          const measurementTime = toHm(measuredAt);

          try {
            setSaving(true);

            const res = await createBloodSugarLog({
              glucoseLevel: Number(value),
              measurementDate,
              measurementTime,
              measurementLabel,
            });

            console.log("bloodSugar save res", res);

            const merged = new Date(date);
            merged.setHours(
              measuredAt.getHours(),
              measuredAt.getMinutes(),
              0,
              0
            );

            setRecords((prev) =>
              [
                ...prev,
                {
                  glucoseLevel: Number(value),
                  measuredAt: merged,
                  measurementLabel,
                },
              ].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())
            );

            setInputVisible(false);
            await fetchDaily();
          } catch (e: any) {
            console.log(
              "bloodSugar save error",
              e?.response?.status,
              e?.response?.data ?? e
            );
            Alert.alert("저장 실패", e?.message ?? "혈당 기록 저장에 실패했어요.");
          } finally {
            setSaving(false);
          }
        }}
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
  headerTitle: { fontWeight: "800", fontSize: 16 },

  container: { padding: 18, paddingBottom: 120 },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    zIndex: 10,
  },

  datePillWrap: {
    alignSelf: "flex-start",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  datePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 18,
  },

  dateText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  datePickerInline: {
    marginLeft: 8,
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
    marginBottom: 6,
  },

  emptyText: { color: "#777", fontSize: 12, marginTop: 8, fontWeight: "700" },

  recordDivider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 10,
    marginHorizontal: 4,
  },

  addBarWrap: {
    marginTop: 30,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  addBar: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  addPlus: { color: "#fff", fontSize: 26, fontWeight: "900" },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 12 },

  darkBtnWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  darkBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  darkBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  pressedBtn: {
    opacity: 0.82,
  },

  chartCard: {
    marginTop: 30,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  chartHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },

  cardTitle: { fontSize: 13, fontWeight: "900", color: "#111" },
  smallText: { fontSize: 11, fontWeight: "700", color: "#777" },

  chartWrap: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
});