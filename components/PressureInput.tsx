import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  title: string;
  initialValue?: [number, number];
  initialMeasuredAt?: Date;
  onClose: () => void;
  onSubmit: (systolic: number, diastolic: number, measuredAt: Date) => void | Promise<void>;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

export default function PressureInput({
  visible,
  title,
  initialValue,
  initialMeasuredAt,
  onClose,
  onSubmit,
}: Props) {
  const [s, setS] = useState<string>("");
  const [d, setD] = useState<string>("");

  // ✅ 시간 변경의 핵심 상태
  const [measuredAt, setMeasuredAt] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ✅ 열릴 때 초기값 세팅
  useEffect(() => {
    if (!visible) return;

    setS(initialValue?.[0] != null ? String(initialValue[0]) : "");
    setD(initialValue?.[1] != null ? String(initialValue[1]) : "");
    setMeasuredAt(initialMeasuredAt ?? new Date());
    setShowTimePicker(false);
  }, [visible, initialValue, initialMeasuredAt]);

  const canSave = useMemo(() => {
    const sv = Number(s);
    const dv = Number(d);
    return Number.isFinite(sv) && Number.isFinite(dv) && sv > 0 && dv > 0;
  }, [s, d]);

  const handleSave = async () => {
    if (!canSave) return;
    const sv = Number(s);
    const dv = Number(d);
    await onSubmit(sv, dv, measuredAt);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color="#111" />
            </Pressable>
          </View>

          {/* ✅ 시간 선택 */}
          <View style={styles.timeRow}>
            <Text style={styles.label}>측정 시간</Text>
            <Pressable
              style={styles.timeBtn}
              onPress={() => setShowTimePicker(true)}
              hitSlop={8}
            >
              <Ionicons name="time-outline" size={16} color="#111" />
              <Text style={styles.timeText}>{fmtTime(measuredAt)}</Text>
            </Pressable>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={measuredAt}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selected) => {
                // Android는 취소 시 selected가 undefined
                if (Platform.OS !== "ios") setShowTimePicker(false);
                if (selected) setMeasuredAt(selected);
              }}
            />
          )}

          {/* ✅ 입력 */}
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>수축기</Text>
              <TextInput
                value={s}
                onChangeText={setS}
                keyboardType="number-pad"
                placeholder="예: 120"
                style={styles.input}
                maxLength={3}
              />
            </View>

            <View style={styles.inputCol}>
              <Text style={styles.label}>이완기</Text>
              <TextInput
                value={d}
                onChangeText={setD}
                keyboardType="number-pad"
                placeholder="예: 80"
                style={styles.input}
                maxLength={3}
              />
            </View>
          </View>

          <View style={styles.btnRow}>
            <Pressable onPress={onClose} style={[styles.btn, styles.btnGhost]}>
              <Text style={[styles.btnText, styles.btnGhostText]}>취소</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={[styles.btn, !canSave && { opacity: 0.5 }]}
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
  title: { fontSize: 16, fontWeight: "900", color: "#111" },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: { fontSize: 12, fontWeight: "800", color: "#444" },
  timeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F1F1F1",
  },
  timeText: { fontSize: 13, fontWeight: "800", color: "#111" },

  inputRow: { flexDirection: "row", gap: 12, marginTop: 6 },
  inputCol: { flex: 1 },
  input: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 12,
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#3C3C3C",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "900" },
  btnGhost: { backgroundColor: "#EDEDED" },
  btnGhostText: { color: "#111" },

  hint: { marginTop: 10, fontSize: 11, color: "#777", fontWeight: "700" },
});