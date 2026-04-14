import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Keyboard,
  KeyboardAvoidingView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";


type Props = {
  visible: boolean;
  title: string;
  initialValue?: [number, number];
  initialMeasuredAt?: Date;
  onClose: () => void;
  onSubmit: (
    systolic: number,
    diastolic: number,
    measuredAt: Date
  ) => void | Promise<void>;
};

export default function PressureInput({
  visible,
  title,
  initialValue,
  initialMeasuredAt,
  onClose,
  onSubmit,
}: Props) {
  const [s, setS] = useState("");
  const [d, setD] = useState("");

  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const dRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;

    setS(initialValue?.[0] != null ? String(initialValue[0]) : "");
    setD(initialValue?.[1] != null ? String(initialValue[1]) : "");
    setTime(initialMeasuredAt ?? new Date());
  }, [visible, initialValue, initialMeasuredAt]);

  const canSave = useMemo(() => {
    const sv = Number(s);
    const dv = Number(d);
    return Number.isFinite(sv) && Number.isFinite(dv) && sv > 0 && dv > 0;
  }, [s, d]);

  const handleSave = async () => {
    if (!canSave) return;
    Keyboard.dismiss();
    await onSubmit(Number(s), Number(d), time);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <Pressable
            style={styles.container}
            onPress={(e) => e.stopPropagation()}
      >
          <Text style={styles.title}>{title}</Text>

          {/* 수축기 */}
          <Text style={styles.label}>수축기 (mmHg)</Text>
          <TextInput
            value={s}
            onChangeText={setS}
            keyboardType="numeric"
            placeholder="예: 120"
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => dRef.current?.focus()}
          />

          {/* 이완기 */}
          <Text style={styles.label}>이완기 (mmHg)</Text>
          <TextInput
            ref={dRef}
            value={d}
            onChangeText={setD}
            keyboardType="numeric"
            placeholder="예: 80"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          {/* 시간 */}
          <Text style={styles.label}>측정 시간</Text>
          <Pressable
            style={styles.timeBox}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.timeText}>
              {time.toLocaleTimeString()}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(e, selected) => {
                if (selected) setTime(selected);
                setShowPicker(false);
              }}
            />
          )}

          {/* 저장 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.submitWrap,
              pressed && styles.pressed,
              !canSave && { opacity: 0.5 },
            ]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <LinearGradient
              colors={["#0D0D0D", "#262626"]}
              style={styles.submitBtn}
            >
              <Text style={styles.submitText}>저장</Text>
            </LinearGradient>
          </Pressable>

          {/* 닫기 */}
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>닫기</Text>
          </Pressable>
        </Pressable>
         </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 6,
    color: "#555",
  },

  input: {
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    fontWeight: "700",
  },

  timeBox: {
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  submitWrap: {
    marginTop: 22,
    borderRadius: 12,
    overflow: "hidden",
  },

  submitBtn: {
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  submitText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  cancel: {
    textAlign: "center",
    marginTop: 12,
    color: "#999",
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.85,
  },
});