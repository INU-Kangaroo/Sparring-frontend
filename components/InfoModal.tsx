import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

type InfoModalProps = {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
};

export default function InfoModal({
  visible,
  title,
  content,
  onClose,
}: InfoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.content}>{content}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#091441",
    borderRadius: 28,
    padding: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  content: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 20,
  },
});
