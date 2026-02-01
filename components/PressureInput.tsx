import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (systolic: number, diastolic: number) => void;
  initialValue?: [number, number];
  title?: string;
}

export default function PressureInput({ visible, onClose, onSubmit, initialValue, title }: Props) {
  const [systolic, setSystolic] = useState<string>("0");
  const [diastolic, setDiastolic] = useState<string>("0");

  useEffect(() => {
    if (initialValue && visible) {
      setSystolic(initialValue[0].toString());
      setDiastolic(initialValue[1].toString());
    }
  }, [initialValue, visible]);

  const handleSubmit = () => {
    onSubmit(parseInt(systolic) || 0, parseInt(diastolic) || 0);
    setSystolic("0");
    setDiastolic("0");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title || "혈압 입력"}</Text>
          <View style={styles.inputRow}>
            <Text>상/이완압:</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={systolic}
              onChangeText={setSystolic}
            />
          </View>
          <View style={styles.inputRow}>
            <Text>이완압:</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={diastolic}
              onChangeText={setDiastolic}
            />
          </View>
          <View style={styles.buttons}>
            <Pressable style={styles.btn} onPress={onClose}>
              <Text>취소</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.submitBtn]} onPress={handleSubmit}>
              <Text style={{ color: "#fff" }}>저장</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000077", justifyContent: "center", alignItems: "center" },
  modal: { width: "80%", backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  title: { fontWeight: "700", fontSize: 16, marginBottom: 12 },
  inputRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, width: 80, padding: 4, textAlign: "center" },
  buttons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8, borderRadius: 8, borderWidth: 1, borderColor: "#ccc" },
  submitBtn: { backgroundColor: "#3C3C3C", borderColor: "transparent" },
});
