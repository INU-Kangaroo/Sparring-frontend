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
import HorizonLine from "@/components/HorizonLine";

import {
  createBloodSugarLog,
  getBloodSugarDaily,
  //deleteBloodSugarLog, 
} from "../api/bloodSugar";


const pad2 = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toHm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const formatTime = (d: Date) => toHm(d);


const screenWidth = Dimensions.get("window").width;

type BloodRecordUI = {
  id: number; 
  glucoseLevel: number;
  measuredAt: Date;
  measurementLabel: string;
};

function normalizeDaily(raw: any): BloodRecordUI[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw?.logs ?? raw?.data ?? raw?.items ?? [];

  return arr
    .map((it: any) => ({
      id: it?.id, 
      glucoseLevel: Number(it?.glucoseLevel),
      measuredAt: new Date(it?.measuredAt),
      measurementLabel: it?.measurementLabel ?? "",
    }))
    .filter((v: any) => v && v.glucoseLevel);
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

  const [chartWidth, setChartWidth] = useState(screenWidth - 36);

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const raw = await getBloodSugarDaily(selectedYmd);
      const list = normalizeDaily(raw).sort(
        (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime()
      );
      setRecords(list);
    } catch {
      Alert.alert("에러", "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, [selectedYmd]);

  const handleDelete = (id: number) => {
    Alert.alert("삭제", "정말 삭제하시겠습니까?", [
      { text: "취소" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            //await deleteBloodSugarLog(id);
            setRecords((prev) => prev.filter((r) => r.id !== id));
          } catch {
            Alert.alert("삭제 실패");
          }
        },
      },
    ]);
  };

  const chart = useMemo(() => {
    const labels = records.map((r) => formatTime(r.measuredAt));
    const values = records.map((r) => r.glucoseLevel);

    return {
      labels: labels.length ? labels : ["-"],
      values: values.length ? values : [0],
    };
  }, [records]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <BackButton onPress={() => router.replace("/main/main")} />
        <Text style={styles.headerTitle}>기록하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 날짜 */}
        <View style={styles.dateRow}>
          <Pressable onPress={() => setShowDatePicker(!showDatePicker)}>
            <LinearGradient
              colors={["#0d0d0dec", "#262626"]}
              style={styles.datePill}
            >
              <Ionicons name="calendar" size={14} color="#fff" />
              <Text style={styles.dateText}>{selectedYmd}</Text>
            </LinearGradient>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "compact" : "default"}
              onChange={(e, d) => {
                if (d) setDate(d);
                setShowDatePicker(false);
              }}
            />
          )}
        </View>

        {/* 혈당 */}
        <Text style={styles.sectionTitle}>혈당</Text>

        {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

        <View style={{ marginTop: 10 }}>
          {!loading && records.length === 0 ? (
            <Text style={styles.emptyText}>
              아직 기록이 없어요. 아래 버튼으로 추가해줘!
            </Text>
          ) : (
            records.map((r, idx) => (
              <View key={r.id}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                      {r.measurementLabel || "혈당"}
                    </Text>

                    <Pressable onPress={() => handleDelete(r.id)}>
                      <Ionicons name="close" size={18} color="#999" />
                    </Pressable>
                  </View>

                  <Text style={styles.cardSub}>
                    ⏰ {formatTime(r.measuredAt)} · {r.glucoseLevel} mg/dL
                  </Text>
                </View>

                
                {idx !== records.length - 1 && <HorizonLine />}
              </View>
            ))
          )}
        </View>

        {/* 추가 버튼 */}
        <Pressable
          style={styles.addButton}
          onPress={() => setInputVisible(true)}
        >
          <Text style={styles.addButtonText}>+ 혈당 추가</Text>
        </Pressable>

        {/* 정보 버튼 */}
        <View style={styles.btnRow}>
          <Pressable
            style={styles.darkBtn}
            onPress={() => { 
              setModalTitle("혈당 측정 방법"); 
              setModalContent( "1. 손을 깨끗이 씻고 말립니다.\n\n" + "2. 테스트 스트립을 측정기에 삽입합니다.\n\n" + "3. 채혈기로 손가락 끝을 살짝 찔러 혈액을 채취합니다.\n\n" + "4. 혈액을 테스트 스트립에 묻힙니다.\n\n" + "5. 결과를 기록합니다." ); 
              setModalVisible(true); }}
          >
            <Text style={styles.darkBtnText}>혈당 측정 방법</Text>
          </Pressable>

          <Pressable
            style={styles.darkBtn}
            onPress={() => {
              setModalTitle("정상 수치");
              setModalContent( "✔ 공복 혈당: 100 mg/dL 미만 \n\n✔ 식후 2시간 혈당: 140 mg/dL 미만" );
              setModalVisible(true);
            }}
          >
            <Text style={styles.darkBtnText}>정상 혈당 수치</Text>
          </Pressable>
        </View>

        {/* 차트 */}
        <LineChart
          data={{
            labels: chart.labels,
            datasets: [
              {
                data: chart.values,
                strokeWidth: 2,
              },
            ],
          }}
          width={chartWidth}
          height={220}
          fromZero
          yAxisInterval={1}
          segments={2} // y축 칸 개수 
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",

            decimalPlaces: 0,

            color: () => "#D99197", // 빨간 선
            labelColor: () => "#666",

            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#e19e9e",
            },

            propsForBackgroundLines: {
              stroke: "#e0e0e0", // 격자 색
              strokeWidth: 1,
            },
          }}
          style={{
            borderRadius: 16,
          }}
        />
      </ScrollView>

      <HomeFab onPress={() => router.push("/main/main")} />

      {/* 입력 */}
      <BloodInputModal
        visible={inputVisible}
        onClose={() => setInputVisible(false)}
        onSubmit={async ({ title, value, measuredAt }) => {
          try {
            setSaving(true);

            await createBloodSugarLog({
              glucoseLevel: Number(value),
              measurementDate: toYmd(date),
              measurementTime: toHm(measuredAt),
              measurementLabel: title,
            });

            setInputVisible(false);
            fetchDaily();
          } catch {
            Alert.alert("저장 실패");
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
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  headerTitle: { fontWeight: "800", fontSize: 16 },

  container: { padding: 18, paddingBottom: 120 },

  dateRow: { flexDirection: "row", marginBottom: 14 },

  datePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 18,
  },

  dateText: { color: "#fff", fontWeight: "800" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },

  emptyText: { color: "#777", fontSize: 12 },

  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitle: { fontWeight: "700" },

  cardSub: { marginTop: 6, color: "#777" },

  addButton: {
    marginTop: 20,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#D99197",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 20 },

  darkBtn: {
    marginTop: 1,
    flex: 1,
    backgroundColor: "#262626",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  darkBtnText: { color: "#fff" },
});