import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { title: string; value: number; measuredAt: Date }) => void;

  initialTitle?: string;
  initialValue?: number;
  initialMeasuredAt?: Date;
};

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export default function BloodInputModal({
  visible,
  onClose,
  onSubmit,
  initialTitle,
  initialValue,
  initialMeasuredAt,
}: Props) {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState<string>("");

  const [measuredAt, setMeasuredAt] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setTitle(initialTitle ?? "");
    setValue(
      typeof initialValue === "number" && Number.isFinite(initialValue)
        ? String(initialValue)
        : ""
    );
    setMeasuredAt(initialMeasuredAt ?? new Date());
    setShowTimePicker(false);
  }, [visible, initialTitle, initialValue, initialMeasuredAt]);

  const timeLabel = useMemo(() => formatTime(measuredAt), [measuredAt]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const n = Number(value);

    if (!Number.isFinite(n)) {
      Alert.alert("입력 오류", "혈당 값을 숫자로 입력해주세요.");
      return;
    }
    if (n <= 0) {
      Alert.alert("입력 오류", "혈당 값은 0보다 커야 해요.");
      return;
    }

    onSubmit({
      title: trimmedTitle, // 비어있으면 부모에서 기본값 처리
      value: Math.round(n),
      measuredAt,
    });

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titleText}>혈당 입력</Text>

          {/* 제목 */}
          <View style={styles.field}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="예: 아침 공복 혈당"
              returnKeyType="done"
            />
          </View>

          {/* 측정시간 */}
          <Pressable
            style={styles.timeRow}
            onPress={() => setShowTimePicker((prev) => !prev)}
          >
            <Text style={styles.timeLeft}>측정 시간</Text>
            <Text style={styles.timeRight}>{timeLabel}</Text>
          </Pressable>

          {showTimePicker && (
            <View style={{ marginBottom: 8 }}>
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

          {/* 혈당 값 */}
          <View style={styles.field}>
            <Text style={styles.label}>혈당(mg/dL)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              value={value}
              onChangeText={setValue}
              placeholder="예: 95"
            />
          </View>

          {/* 버튼 */}
          <View style={styles.buttons}>
            <Pressable
              style={styles.btn}
              onPress={() => {
                setShowTimePicker(false);
                onClose();
              }}
            >
              <Text>취소</Text>
            </Pressable>

            <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleSave}>
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
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  titleText: { fontWeight: "700", fontSize: 16, marginBottom: 12 },

  field: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6, color: "#333" },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },
  timeLeft: { fontSize: 13, color: "#333", fontWeight: "600" },
  timeRight: { fontSize: 13, color: "#111", fontWeight: "700" },

  buttons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  saveBtn: { backgroundColor: "#3C3C3C", borderColor: "transparent" },
});