import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
  visible: boolean;
  onClose?: () => void; // ✅ optional
  onSubmit?: (systolic: number, diastolic: number, measuredAt: Date) => void; // ✅ optional
  initialValue?: [number, number];
  initialMeasuredAt?: Date;
  title?: string;
}

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0"
  )}`;

export default function PressureInput({
  visible,
  onClose,
  onSubmit,
  initialValue,
  initialMeasuredAt,
  title,
}: Props) {
  const [systolic, setSystolic] = useState<string>("0");
  const [diastolic, setDiastolic] = useState<string>("0");

  // 사용자가 선택하는 "측정 시간"
  const [measuredAt, setMeasuredAt] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ✅ 안전 닫기: props가 없어도 앱 안 죽게
  const safeClose = () => {
    setShowTimePicker(false);
    if (typeof onClose === "function") onClose();
    else console.warn("[PressureInput] onClose prop이 없습니다.");
  };

  // 모달 열릴 때 초기값 세팅
  useEffect(() => {
    if (!visible) return;

    if (initialValue) {
      setSystolic(String(initialValue[0]));
      setDiastolic(String(initialValue[1]));
    } else {
      setSystolic("0");
      setDiastolic("0");
    }

    setMeasuredAt(initialMeasuredAt ?? new Date());
    setShowTimePicker(false);
  }, [initialValue, initialMeasuredAt, visible]);

  const handleSubmit = () => {
    const s = parseInt(systolic, 10);
    const d = parseInt(diastolic, 10);

    // ✅ onSubmit 없는 경우에도 안 죽게
    if (typeof onSubmit !== "function") {
      console.warn("[PressureInput] onSubmit prop이 없습니다.");
      safeClose();
      return;
    }

    onSubmit(
      Number.isFinite(s) ? s : 0,
      Number.isFinite(d) ? d : 0,
      measuredAt
    );

    // 리셋
    setSystolic("0");
    setDiastolic("0");
    setMeasuredAt(new Date());
    setShowTimePicker(false);

    // 저장 후 닫기
    safeClose();
  };

  const timeLabel = useMemo(() => formatTime(measuredAt), [measuredAt]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={safeClose} // ✅ Android back 버튼 대응
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title || "혈압 입력"}</Text>

          {/* 측정 시간 선택 */}
          <Pressable
            style={styles.timeRow}
            onPress={() => setShowTimePicker((prev) => !prev)}
          >
            <Text style={styles.timeLeft}>측정 시간</Text>
            <Text style={styles.timeRight}>{timeLabel}</Text>
          </Pressable>

          {showTimePicker && (
            <View style={{ marginBottom: 6 }}>
              <DateTimePicker
                value={measuredAt}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selected) => {
                  if (Platform.OS !== "ios") setShowTimePicker(false);
                  if (selected) setMeasuredAt(selected);
                }}
              />

              {Platform.OS === "ios" && (
                <Pressable
                  style={[styles.btn, { alignSelf: "flex-end", marginTop: 8 }]}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text>시간 선택 완료</Text>
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.inputRow}>
            <Text>수축기:</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={systolic}
              onChangeText={setSystolic}
              placeholder="예: 120"
            />
          </View>

          <View style={styles.inputRow}>
            <Text>이완기:</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={diastolic}
              onChangeText={setDiastolic}
              placeholder="예: 80"
            />
          </View>

          <View style={styles.buttons}>
            <Pressable style={styles.btn} onPress={safeClose}>
              <Text>취소</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.submitBtn]}
              onPress={handleSubmit}
            >
              <Text style={{ color: "#fff" }}>저장</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000077",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  title: { fontWeight: "700", fontSize: 16, marginBottom: 12 },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },
  timeLeft: { fontSize: 13, color: "#333", fontWeight: "600" },
  timeRight: { fontSize: 13, color: "#111", fontWeight: "700" },

  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: 90,
    padding: 6,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  submitBtn: { backgroundColor: "#3C3C3C", borderColor: "transparent" },
});
