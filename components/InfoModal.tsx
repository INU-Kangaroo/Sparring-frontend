import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
        <Pressable onPress={() => {}} style={styles.cardWrap}>
          <LinearGradient
            colors={[ "#f6f6f6f0", "#f6f6f6f0"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.content}>{content}</Text>
          </LinearGradient>
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
    padding: 15,
  },
  cardWrap: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
  },
  title: {
    color: "#0c0c0c",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  content: {
    color: "#000000",
    fontSize: 13,
    lineHeight: 20,
  },
});