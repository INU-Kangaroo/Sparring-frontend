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
import InfoModal from "../../components/InfoModal";
import BloodInputModal from "../../components/BloodInput";

import { createBloodSugarLog, getBloodSugarDaily } from "../api/bloodSugar";

const screenWidth = Dimensions.get("window").width;

type BloodRecord = {
  title: string;
  value: number;
  measuredAt: Date;
};

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0"
  )}`;

const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ✅ 백엔드 응답 키가 달라도 최대한 파싱
function normalizeDailyResponseToRecords(raw: any): BloodRecord[] {
  const arr = Array.isArray(raw) ? raw : raw?.logs ?? raw?.data ?? raw?.items ?? [];
  if (!Array.isArray(arr)) return [];

  return arr
    .map((it: any) => {
      const value = Number(it?.value ?? it?.bloodSugar ?? it?.glucose);
      const measuredAtStr = it?.measuredAt ?? it?.measured_at ?? it?.createdAt ?? it?.timestamp;
      if (!Number.isFinite(value)) return null;

      const measuredAt = measuredAtStr ? new Date(measuredAtStr) : new Date();
      const title = String(it?.title ?? it?.label ?? it?.type ?? "혈당 기록");

      return { title, value, measuredAt } as BloodRecord;
    })
    .filter(Boolean) as BloodRecord[];
}

export default function BloodRecordScreen() {
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [inputVisible, setInputVisible] = useState(false);
  const [bloodRecords, setBloodRecords] = useState<BloodRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const selectedYmd = useMemo(() => toYmd(date), [date]);

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const raw = await getBloodSugarDaily(selectedYmd);
      const records = normalizeDailyResponseToRecords(raw);

      // 시간순 정렬(선택)
      records.sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());

      setBloodRecords(records);
    } catch (e: any) {
      Alert.alert("불러오기 실패", e?.message ?? "혈당 기록을 불러오지 못했어요.");
      setBloodRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 날짜 바뀔 때마다 조회
  useEffect(() => {
    fetchDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYmd]);

  // ✅ 차트 데이터
  const chartData = useMemo(() => {
    return {
      labels: bloodRecords.map((_, i) => (i + 1).toString()),
      values: bloodRecords.map((r) => r.value),
    };
  }, [bloodRecords]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>혈당 기록</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Date */}
        <Pressable style={styles.datePill} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={14} color="#fff" />
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
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

        {loading && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        )}

        {/* Records */}
        <View style={{ marginTop: 6 }}>
          {!loading && bloodRecords.length === 0 ? (
            <Text style={{ color: "#777", fontSize: 12, marginTop: 10 }}>
              아직 기록이 없어요. 아래 ＋ 버튼으로 추가해줘!
            </Text>
          ) : (
            bloodRecords.map((record, index) => (
              <View key={`${record.title}-${index}`} style={styles.recordRow}>
                <View style={styles.dot} />
                <View style={styles.recordText}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordValue}>
                    {record.value} mg/dL ({formatTime(record.measuredAt)})
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add */}
        <Pressable
          style={[styles.addBtn, saving && { opacity: 0.7 }]}
          onPress={() => setInputVisible(true)}
          disabled={saving}
        >
          <Text style={styles.addText}>＋</Text>
        </Pressable>

        {/* Info Buttons */}
        <View style={styles.infoRow}>
          <Pressable
            style={styles.infoBtn}
            onPress={() => {
              setModalTitle("혈당 측정 방법");
              setModalContent(
                "1. 손을 깨끗이 씻고 말립니다.\n" +
                  "2. 테스트 스트립을 측정기에 삽입합니다.\n" +
                  "3. 채혈기로 손가락 끝을 살짝 찔러 혈액을 채취합니다.\n" +
                  "4. 혈액을 테스트 스트립에 묻힙니다.\n" +
                  "5. 결과를 기록합니다."
              );
              setModalVisible(true);
            }}
          >
            <Text style={styles.infoText}>혈당 측정 방법</Text>
          </Pressable>

          <Pressable
            style={styles.infoBtn}
            onPress={() => {
              setModalTitle("혈당 정상 수치");
              setModalContent("✔ 공복 혈당: 70-99 mg/dL\n" + "✔ 식후 2시간 혈당: 140 mg/dL 미만");
              setModalVisible(true);
            }}
          >
            <Text style={styles.infoText}>혈당 정상 수치</Text>
          </Pressable>
        </View>

        {/* Chart */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>혈당 통계</Text>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  data: chartData.values.length ? chartData.values : [0],
                  color: () => "#ca1515",
                },
              ],
            }}
            width={screenWidth - 70}
            height={200}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => "#3C3C3C",
              labelColor: () => "#333",
            }}
            style={{ borderRadius: 17 }}
          />
        </View>
      </ScrollView>

      <HomeFab onPress={() => router.push("/main/main")} />

      {/* Info Modal */}
      <InfoModal
        visible={modalVisible}
        title={modalTitle}
        content={modalContent}
        onClose={() => setModalVisible(false)}
      />

      {/* ✅ Blood Input Modal */}
      <BloodInputModal
        visible={inputVisible}
        onClose={() => setInputVisible(false)}
        onSubmit={async ({ title, value, measuredAt }) => {
          const safeTitle = title?.trim() || "혈당 기록";

          // ✅ 화면에서 선택한 날짜(date) + 모달에서 선택한 시간(measuredAt) 합치기
          const merged = new Date(date);
          merged.setHours(measuredAt.getHours(), measuredAt.getMinutes(), 0, 0);

          try {
            setSaving(true);

            await createBloodSugarLog({
              value: Number(value),
              measuredAt: merged.toISOString(),
              title: safeTitle, // 백엔드가 안 받으면 무시될 수 있음
            });

            setInputVisible(false);
            await fetchDaily();
          } catch (e: any) {
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
  headerTitle: { fontWeight: "700" },

  container: { padding: 20, backgroundColor: "#F5F5F5" },

  datePill: {
    flexDirection: "row",
    backgroundColor: "#3C3C3C",
    padding: 10,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  dateText: { color: "#fff", marginLeft: 6 },

  addBtn: {
    height: 50,
    backgroundColor: "#3C3C3C",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  addText: { color: "#fff", fontSize: 28 },

  infoRow: { flexDirection: "row", marginBottom: 20 },
  infoBtn: {
    flex: 1,
    backgroundColor: "#3C3C3C",
    marginHorizontal: 6,
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: { color: "#fff", fontSize: 12 },

  statsCard: {
    backgroundColor: "#eee",
    padding: 16,
    borderRadius: 16,
  },
  statsTitle: { fontWeight: "700", marginBottom: 10 },

  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f0f0f089",
    borderRadius: 5,
    padding: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#d30c0c",
  },
  recordText: { flexDirection: "column" },
  recordTitle: { fontWeight: "700", fontSize: 14 },
  recordValue: { fontSize: 12, color: "#555" },
});