import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  Platform,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    value: string;
    measuredAt: Date;
  }) => void;
};

const TYPES = ["공복", "식전", "식후"];

export default function BloodInputModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [type, setType] = useState("공복");
  const [value, setValue] = useState("");

  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [date] = useState(new Date());

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <Text style={styles.title}>혈당 기록</Text>

          {/* 유형 선택 */}
          <Text style={styles.label}>유형</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => {
              const selected = t === type;
              return (
                <Pressable
                  key={t}
                  style={[
                    styles.typeBtn,
                    selected && styles.typeBtnActive,
                  ]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      selected && styles.typeTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 혈당 값 */}
          <Text style={styles.label}>혈당 (mg/dL)</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholder="예: 98"
            style={styles.input}
          />

          {/* 시간 선택 */}
          <Text style={styles.label}>측정 시간</Text>
          <Pressable
            style={styles.timeBox}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.timeText}>
              측정 시간: {time.toLocaleTimeString()}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(e, selected) => {
                setShowPicker(false);
                if (selected) setTime(selected);
              }}
            />
          )}


          {/* 버튼 */}
          <Pressable
            style={styles.submitBtn}
            onPress={() => {
              if (!value) return;

              onSubmit({
                title: type,
                value,
                measuredAt: new Date(),
              });
            }}
          >
            <Text style={styles.submitText}>저장</Text>
          </Pressable>

          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
    color: "#555",
  },

  typeRow: {
    flexDirection: "row",
    gap: 8,
  },

  typeBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  typeBtnActive: {
    backgroundColor: "#d99298",
  },

  typeText: {
    color: "#777",
    fontWeight: "600",
  },

  typeTextActive: {
    color: "#F2F2F2",
    fontWeight: "800",
  },

  input: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
  },

  timeBox: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  timeText: {
    fontSize: 14,
  },

  submitBtn: {
    marginTop: 20,
    height: 44,
    backgroundColor: "#111",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "800",
  },

  cancel: {
    textAlign: "center",
    marginTop: 10,
    color: "#999",
  },
});