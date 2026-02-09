import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";

import RecordItem from "../../components/RecordItem";
import HomeFab from "../../components/HomeButton";
import InfoModal from "../../components/InfoModal";
import BloodInputSheet from "../../components/BloodInput";

const screenWidth = Dimensions.get("window").width;
type BloodRecord = {
  value: number;
  time: string;
  type: "공복" | "식후"; 
};

export default function BloodRecordScreen() {
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [inputVisible, setInputVisible] = useState(false);
  const [bloodRecords, setBloodRecords] = useState<BloodRecord[]>([]); // 초기값 없음

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const getNowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

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

        {/* Records */}
        <View>
       {bloodRecords.map((record, index) => (
          <View key={index} style={styles.recordRow}>
            {/* 점 */}
            <View
              style={[
                styles.dot,
                { backgroundColor: record.type === "공복" ? "red" : "blue" },
              ]}
            />

            {/* 텍스트: 공복/식후 + 값 + 시간 */}
            <View style={styles.recordText}>
              <Text style={styles.recordTitle}>{record.type} 혈당</Text>
              <Text style={styles.recordValue}>
                {record.value} mg/dL ({record.time})
              </Text>
            </View>
          </View>
        ))}




        </View>

        {/* Add */}
        <Pressable style={styles.addBtn} onPress={() => setInputVisible(true)}>
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
              setModalContent(
                "✔ 공복 혈당: 70-99 mg/dL\n" +
                "✔ 식후 2시간 혈당: 140 mg/dL 미만"
              );
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
              labels: bloodRecords.map((_, i) => (i + 1).toString()),
              datasets: [{ data: bloodRecords.map(r => r.value), color: () => "#3C3C3C"}],
            }}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => "#3C3C3C",
            }}
            style={{ borderRadius: 16 }}
          />
        </View>
      </ScrollView>

      <HomeFab onPress={() => router.push("/main/main")} />

      {/* Modals */}
      <InfoModal
        visible={modalVisible}
        title={modalTitle}
        content={modalContent}
        onClose={() => setModalVisible(false)}
      />

      {/* Blood Input Sheet */}
      <BloodInputSheet
        visible={inputVisible}
        onClose={() => setInputVisible(false)}
        onSubmit={(v, type) => {
          setBloodRecords([
            ...bloodRecords,
            { value: v, time: getNowTime(), type }, 
          ]);
        }}
      />

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5"  },
  header: {
    height: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerTitle: { fontWeight: "700" },
  container: { padding: 20, backgroundColor: "#F5F5F5"  },
  datePill: {
    flexDirection: "row",
    backgroundColor: "#3C3C3C",
    padding: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  dateText: { color: "#fff", marginLeft: 6 },
  addBtn: {
    height : 50,
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
},
dot: {
  width: 12,
  height: 12,
  borderRadius: 6,
  marginRight: 12,
},
recordText: {
  flexDirection: "column",
},
recordTitle: {
  fontWeight: "700",
  fontSize: 14,
},
recordValue: {
  fontSize: 12,
  color: "#555",
},

});
