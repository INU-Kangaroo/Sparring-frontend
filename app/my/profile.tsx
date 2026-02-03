// app/my/profile.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type ProfileForm = {
  name: string;
  birth: string;
  phone: string;
  email: string;
  height: string;
  weight: string;
};

type FieldKey = keyof ProfileForm;

const FIELD_LABELS: Record<FieldKey, string> = {
  name: "이름",
  birth: "생년월일",
  phone: "휴대폰 번호",
  email: "이메일 주소",
  height: "키",
  weight: "몸무게",
};

type ConfirmModalType = "logout" | "withdraw" | null;

export default function ProfileScreen() {
  // 처음엔 전부 비어있게 => 화면에는 "+ 추가"로 뜸
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    birth: "",
    phone: "",
    email: "",
    height: "",
    weight: "",
  });

  //지금 수정 중인 "한 항목"만 input으로 만들기 위한 상태
  const [activeField, setActiveField] = useState<FieldKey | null>(null);

  // 확인 모달 상태
  const [modalType, setModalType] = useState<ConfirmModalType>(null);

  // 입력 포커스용 ref
  const inputRefs = useRef<Record<FieldKey, TextInput | null>>({
    name: null,
    birth: null,
    phone: null,
    email: null,
    height: null,
    weight: null,
  });

  const displayUserName = useMemo(
    () => form.name?.trim() || "유저 이름",
    [form.name]
  );

  const focusField = (key: FieldKey) => {
    setActiveField(key);
    requestAnimationFrame(() => inputRefs.current[key]?.focus());
  };

  const updateField = (key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 헤더 우측 체크(또는 연필) 누르면 현재 입력만 종료
  const closeEditing = () => setActiveField(null);

  // 로그아웃 / 회원탈퇴
  const handleLogout = () => {
    setModalType("logout");
  };

  const handleWithdraw = () => {
    setModalType("withdraw");
  };

  const confirmAction = () => {
    setModalType(null);
    router.replace("/login");
  };

  const cancelAction = () => {
    setModalType(null);
  };

  const renderRow = (key: FieldKey) => {
    const value = form[key]?.trim();
    const isEmpty = !value;

    const shouldShowInput = activeField === key;

    return (
      <View key={key} style={styles.row}>
        <Text style={styles.label}>{FIELD_LABELS[key]}</Text>

        <View style={styles.valueArea}>
          {shouldShowInput ? (
            <TextInput
              ref={(r) => {
                if (r) inputRefs.current[key] = r;
              }}
              value={form[key]}
              onChangeText={(t) => updateField(key, t)}
              placeholder="+ 추가"
              placeholderTextColor="#B5B5B5"
              style={styles.input}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => setActiveField(null)} // 엔터 누르면 이 항목만 종료
            />
          ) : (
            <Pressable onPress={() => focusField(key)} hitSlop={10}>
              <Text style={[styles.valueText, isEmpty && styles.addText]}>
                {isEmpty ? "+ 추가" : value}
              </Text>
            </Pressable>
          )}
        </View>

        {/* 우측 아이콘: 누르면 해당 항목만 편집 시작 */}
        <Pressable
          onPress={() => focusField(key)}
          hitSlop={10}
          style={styles.rowIconBtn}
        >
          <Ionicons name="create-outline" size={18} color="#B7B7B7" />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color="#111" />
            </Pressable>

            <Text style={styles.headerTitle}>프로필 설정</Text>

            <Pressable onPress={closeEditing} hitSlop={10}>
              {/* 입력 중이면 체크, 아니면 연필 */}
              <Ionicons
                name={activeField ? "checkmark" : "create-outline"}
                size={20}
                color="#111"
              />
            </Pressable>
          </View>

          {/* 상단 프로필 */}
          <View style={styles.profileTop}>
            <View style={styles.avatar} />

            <View style={styles.nameRow}>
              <Text style={styles.userName}>{displayUserName}</Text>
              <Pressable onPress={() => focusField("name")} hitSlop={10}>
                <Ionicons
                  name="create-outline"
                  size={16}
                  color="#111"
                  style={{ marginLeft: 6 }}
                />
              </Pressable>
            </View>
          </View>

          {/* 기본 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>

            <View style={styles.list}>
              {(
                ["name", "birth", "phone", "email", "height", "weight"] as FieldKey[]
              ).map(renderRow)}
            </View>

            {/* 로그아웃 | 회원탈퇴 */}
            <View style={styles.footerActions}>
              <Pressable onPress={handleLogout} hitSlop={10}>
                <Text style={styles.footerButton}>로그아웃</Text>
              </Pressable>

              <Text style={styles.footerDivider}>|</Text>

              <Pressable onPress={handleWithdraw} hitSlop={10}>
                <Text style={styles.footerButton}>회원탈퇴</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 로그아웃 확인 모달 */}
      <Modal
        visible={modalType === "logout"}
        transparent
        animationType="fade"
        onRequestClose={cancelAction}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>로그아웃</Text>
            <Text style={styles.modalMessage}>로그아웃 하시겠습니까?</Text>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={cancelAction}
                style={[styles.modalBtn, styles.modalBtnCancel]}
              >
                <Text style={styles.modalBtnTextCancel}>취소</Text>
              </Pressable>

              <Pressable
                onPress={confirmAction}
                style={[styles.modalBtn, styles.modalBtnConfirm]}
              >
                <Text style={styles.modalBtnTextConfirm}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 회원탈퇴 확인 모달 */}
      <Modal
        visible={modalType === "withdraw"}
        transparent
        animationType="fade"
        onRequestClose={cancelAction}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>정말로 회원을 탈퇴하시겠습니까?</Text>
            <Text style={styles.modalMessage}>
              회원을 탈퇴하면 그 동안의 기록과{"\n"}데이터가 모두 삭제됩니다.
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={cancelAction}
                style={[styles.modalBtn, styles.modalBtnCancel]}
              >
                <Text style={styles.modalBtnTextCancel}>취소</Text>
              </Pressable>

              <Pressable
                onPress={confirmAction}
                style={[styles.modalBtn, styles.modalBtnConfirm, styles.modalBtnWithdraw]}
              >
                <Text style={styles.modalBtnTextConfirm}>확인했습니다</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },

  container: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 30 },

  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  profileTop: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 18,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: "#E6E6E6",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  userName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 14,
    paddingLeft: 8,
  },

  list: {
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 2,
  },

  label: {
    width: 90,
    fontSize: 15,
    color: "#A7A7A7",
    fontWeight: "500",
    paddingLeft: 8,
  },

  valueArea: {
    flex: 1,
    alignItems: "center",
  },

  valueText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    textAlign: "left",
  },

  addText: {
    color: "#2F6BFF",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    textAlign: "left",
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  rowIconBtn: {
    width: 32,
    alignItems: "flex-end",
  },

  footerActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  footerButton: {
    fontSize: 15,
    color: "#9A9A9A",
    fontWeight: "500",
  },

  footerDivider: {
    marginHorizontal: 10,
    fontSize: 15,
    color: "#C7C7C7",
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
  },

  modalMessage: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  modalBtnCancel: {
    backgroundColor: "#E6E6E6",
  },

  modalBtnConfirm: {
    backgroundColor: "#3F7BFF",
  },

  modalBtnWithdraw: {
    backgroundColor: "#FF4444",
  },

  modalBtnTextCancel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },

  modalBtnTextConfirm: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});