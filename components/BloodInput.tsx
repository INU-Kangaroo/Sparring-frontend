import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: number, type: "공복" | "식후") => void;
};

export default function BloodInputSheet({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [value, setValue] = useState("");
  const [type, setType] = useState<"공복" | "식후">("공복"); // 혈당 타입 상태

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>혈당 입력</Text>

          {/* 혈당 값 입력 */}
          <TextInput
            style={styles.input}
            placeholder="mg/dL"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />

          {/* 혈당 타입 선택 */}
          <View style={styles.typeRow}>
            <Pressable
              style={[styles.typeBtn, type === "공복" && styles.selected]}
              onPress={() => setType("공복")}
            >
              <Text style={styles.typeText}>공복</Text>
            </Pressable>
            <Pressable
              style={[styles.typeBtn, type === "식후" && styles.selected]}
              onPress={() => setType("식후")}
            >
              <Text style={styles.typeText}>식후</Text>
            </Pressable>
          </View>

          {/* 저장 버튼 */}
          <Pressable
            style={styles.submit}
            onPress={() => {
              if (!value) return;
              onSubmit(Number(value), type); // 타입과 함께 전달
              setValue("");
              setType("공복"); // 초기화
              onClose();
            }}
          >
            <Text style={styles.submitText}>저장</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  selected: {
    backgroundColor: "#3C3C3C",
  },
  typeText: {
    fontWeight: "700",
    color: "#000",
  },
  submit: {
    height: 48,
    backgroundColor: "#3C3C3C",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
});
