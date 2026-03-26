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

  const canSave = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0;
  }, [value]);

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
      title: trimmedTitle,
      value: Math.round(n),
      measuredAt,
    });

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.title}>혈당 입력</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="예: 아침 공복 혈당"
              placeholderTextColor="#8A97C7"
              returnKeyType="done"
            />
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.label}>측정 시간</Text>
            <Pressable
              style={styles.timeBtn}
              onPress={() => setShowTimePicker((prev) => !prev)}
              hitSlop={8}
            >
              <Text style={styles.timeText}>{timeLabel}</Text>
            </Pressable>
          </View>

          {showTimePicker && (
            <View style={styles.timePickerWrap}>
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
                  style={[styles.btn, styles.btnGhost, styles.inlineDoneBtn]}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={[styles.btnText, styles.btnGhostText]}>시간 선택 완료</Text>
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>혈당(mg/dL)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={value}
              onChangeText={setValue}
              placeholder="예: 95"
              placeholderTextColor="#8A97C7"
            />
          </View>

          <View style={styles.btnRow}>
            <Pressable onPress={onClose} style={[styles.btn, styles.btnGhost]}>
              <Text style={[styles.btnText, styles.btnGhostText]}>취소</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={[styles.btn, styles.btnPrimary, !canSave && styles.btnDisabled]}
            >
              <Text style={styles.btnText}>저장</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            날짜는 상단 캘린더에서 선택하고, 시간은 여기서 선택해 저장해요.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },

  sheet: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },

  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
  },

  closeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  field: {
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#444",
    marginBottom: 6,
  },

  input: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#DCE8FF",
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  timeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D6E4FF",
  },

  timeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1435B9",
  },

  timePickerWrap: {
    marginBottom: 8,
  },

  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  btn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  btnPrimary: {
    backgroundColor: "#1745BA",
  },

  btnDisabled: {
    opacity: 0.5,
  },

  btnGhost: {
    backgroundColor: "#EAF1FF",
    borderWidth: 1,
    borderColor: "#D5E3FF",
  },

  btnText: {
    color: "#fff",
    fontWeight: "900",
  },

  btnGhostText: {
    color: "#2E5BDB",
  },

  inlineDoneBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingHorizontal: 14,
    flex: 0,
  },

  hint: {
    marginTop: 10,
    fontSize: 11,
    color: "#777",
    fontWeight: "700",
  },
});