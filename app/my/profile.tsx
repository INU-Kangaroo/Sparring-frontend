import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

import {
  changeMyPassword,
  deleteMyAccount,
  getMyProfile,
  updateMyProfile,
} from "../api/users";
import { removeTokenFromStorage } from "../utils/asyncStorage";
import {
  clearSignupProfile,
  clearSurveyAnswers,
  saveSignupProfile,
  updateStoredSurveyAnswer,
} from "../utils/profileStorage";

type ProfileForm = {
  name: string;
  birth: string;
  email: string;
  height: string;
  weight: string;
};

type FieldKey = keyof ProfileForm;

const FIELD_LABELS: Record<FieldKey, string> = {
  name: "이름",
  birth: "생년월일",
  email: "이메일 주소",
  height: "키",
  weight: "몸무게",
};

const EDITABLE_FIELDS: FieldKey[] = ["name", "birth", "height", "weight"];

type ConfirmModalType = "logout" | "withdraw" | null;

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EMPTY_FORM: ProfileForm = {
  name: "",
  birth: "",
  email: "",
  height: "",
  weight: "",
};

const EMPTY_PASSWORD_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function formatDateForDisplay(value?: string) {
  if (!value) return "";
  return value.replace(/-/g, ".");
}

function formatDateForApi(value: string) {
  return value.trim().replace(/\./g, "-");
}

function formatNumberForInput(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return Number.isInteger(value) ? String(value) : String(value);
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

export default function ProfileScreen() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(EMPTY_PASSWORD_FORM);
  const [initialForm, setInitialForm] = useState<ProfileForm>(EMPTY_FORM);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [modalType, setModalType] = useState<ConfirmModalType>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const inputRefs = useRef<Record<FieldKey, TextInput | null>>({
    name: null,
    birth: null,
    email: null,
    height: null,
    weight: null,
  });

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();
        if (!mounted) return;

        const nextForm = {
          name: profile.username?.trim() ?? "",
          birth: formatDateForDisplay(profile.birthDate),
          email: profile.email?.trim() ?? "",
          height: formatNumberForInput(profile.height),
          weight: formatNumberForInput(profile.weight),
        };

        setForm(nextForm);
        setInitialForm(nextForm);
      } catch (e: any) {
        Alert.alert(
          "프로필 조회 실패",
          e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const displayUserName = useMemo(
    () => form.name.trim() || "유저 이름",
    [form.name]
  );
  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );

  const focusField = (key: FieldKey) => {
    if (!EDITABLE_FIELDS.includes(key)) return;
    setActiveField(key);
    requestAnimationFrame(() => inputRefs.current[key]?.focus());
  };

  const updateField = (key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeEditing = () => setActiveField(null);

  const handleLogout = () => {
    setModalType("logout");
  };

  const handleWithdraw = () => {
    setModalType("withdraw");
  };

  const resetLocalUserState = async () => {
    await Promise.all([
      removeTokenFromStorage(),
      clearSignupProfile(),
      clearSurveyAnswers(),
    ]);
  };

  const confirmAction = async () => {
    if (!modalType) return;

    try {
      if (modalType === "withdraw") {
        await deleteMyAccount();
      }

      await resetLocalUserState();
      setModalType(null);
      router.replace("/login");
    } catch (e: any) {
      Alert.alert(
        modalType === "withdraw" ? "회원 탈퇴 실패" : "로그아웃 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  const cancelAction = () => {
    setModalType(null);
  };

  const handleSave = async () => {
    if (!hasChanges || saving) return;

    const parsedHeight = parseOptionalNumber(form.height);
    const parsedWeight = parseOptionalNumber(form.weight);

    if (parsedHeight === null || parsedWeight === null) {
      Alert.alert("입력 확인", "키와 몸무게는 숫자로 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        username: form.name.trim() || undefined,
        birthDate: form.birth.trim() ? formatDateForApi(form.birth) : undefined,
        height: parsedHeight,
        weight: parsedWeight,
      };

      const updated = await updateMyProfile(payload);

      const nextForm = {
        name: updated.username?.trim() ?? form.name.trim(),
        birth: formatDateForDisplay(updated.birthDate ?? payload.birthDate),
        email: updated.email?.trim() ?? form.email.trim(),
        height:
          formatNumberForInput(updated.height) ||
          formatNumberForInput(parsedHeight ?? undefined),
        weight:
          formatNumberForInput(updated.weight) ||
          formatNumberForInput(parsedWeight ?? undefined),
      };

      setForm(nextForm);
      setInitialForm(nextForm);
      setActiveField(null);

      await saveSignupProfile({
        email: nextForm.email || form.email.trim() || undefined,
        username: nextForm.name || form.name.trim() || undefined,
        birthDate:
          updated.birthDate ??
          payload.birthDate ??
          (form.birth.trim() ? formatDateForApi(form.birth) : undefined),
        gender: updated.gender,
        height: updated.height ?? parsedHeight ?? undefined,
        weight: updated.weight ?? parsedWeight ?? undefined,
        profileImageUrl: updated.profileImageUrl,
      });

      if (typeof (updated.height ?? parsedHeight) === "number") {
        await updateStoredSurveyAnswer("HEIGHT", updated.height ?? parsedHeight!);
      }
      if (typeof (updated.weight ?? parsedWeight) === "number") {
        await updateStoredSurveyAnswer("WEIGHT", updated.weight ?? parsedWeight!);
      }

      Alert.alert("저장 완료", "변경한 내 정보가 저장되었어요.");
    } catch (e: any) {
      Alert.alert(
        "저장 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
      );
    } finally {
      setSaving(false);
    }
  };

  const openPasswordModal = () => {
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordModalVisible(true);
  };

  const closePasswordModal = () => {
    if (passwordSaving) return;
    setPasswordModalVisible(false);
    setPasswordForm(EMPTY_PASSWORD_FORM);
  };

  const updatePasswordField = (key: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = async () => {
    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("입력 확인", "비밀번호 항목을 모두 입력해주세요.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("입력 확인", "새 비밀번호는 8자 이상으로 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("입력 확인", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setPasswordSaving(true);
      await changeMyPassword({ currentPassword, newPassword });
      closePasswordModal();
      Alert.alert("변경 완료", "비밀번호가 변경되었어요.");
    } catch (e: any) {
      Alert.alert(
        "비밀번호 변경 실패",
        e?.response?.data?.message ?? e?.message ?? "잠시 후 다시 시도해주세요."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const renderRow = (key: FieldKey) => {
    const value = form[key]?.trim();
    const isEmpty = !value;
    const shouldShowInput = activeField === key;
    const isEditable = EDITABLE_FIELDS.includes(key);
    const keyboardType =
      key === "email" ? "email-address" : key === "height" || key === "weight" ? "decimal-pad" : "default";

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
              autoCapitalize="none"
              keyboardType={keyboardType}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={closeEditing}
            />
          ) : (
            <Pressable onPress={() => focusField(key)} hitSlop={10} disabled={!isEditable}>
              <Text style={[styles.valueText, isEmpty && styles.addText]}>
                {isEmpty ? "+ 추가" : value}
              </Text>
            </Pressable>
          )}
        </View>

        {isEditable ? (
          <Pressable
            onPress={() => focusField(key)}
            hitSlop={10}
            style={styles.rowIconBtn}
          >
            <Ionicons name="create-outline" size={18} color="#B7B7B7" />
          </Pressable>
        ) : (
          <View style={styles.rowIconBtn} />
        )}
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
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color="#111" />
            </Pressable>

            <Text style={styles.headerTitle}>프로필 설정</Text>

            <Pressable onPress={activeField ? closeEditing : handleSave} hitSlop={10}>
              <Ionicons
                name={activeField ? "checkmark" : "save-outline"}
                size={20}
                color="#111"
              />
            </Pressable>
          </View>

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

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>기본 정보</Text>
              <Pressable
                onPress={handleSave}
                disabled={!hasChanges || saving || loading}
                style={[
                  styles.saveButton,
                  (!hasChanges || saving || loading) && styles.saveButtonDisabled,
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "저장 중..." : "저장"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.list}>
              {(["name", "birth", "email", "height", "weight"] as FieldKey[]).map(
                renderRow
              )}
            </View>

            <Pressable style={styles.passwordButton} onPress={openPasswordModal}>
              <Text style={styles.passwordButtonText}>비밀번호 변경</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </Pressable>

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

          {loading ? (
            <Text style={styles.helperText}>프로필 정보를 불러오는 중입니다.</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

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
                style={[
                  styles.modalBtn,
                  styles.modalBtnConfirm,
                  styles.modalBtnWithdraw,
                ]}
              >
                <Text style={styles.modalBtnTextConfirm}>확인했습니다</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>비밀번호 변경</Text>
            <Text style={styles.modalMessage}>
              현재 비밀번호와 새 비밀번호를 입력해주세요.
            </Text>

            <View style={styles.passwordFieldList}>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(text) => updatePasswordField("currentPassword", text)}
                placeholder="현재 비밀번호"
                secureTextEntry
                autoCapitalize="none"
                style={styles.passwordInput}
              />
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(text) => updatePasswordField("newPassword", text)}
                placeholder="새 비밀번호"
                secureTextEntry
                autoCapitalize="none"
                style={styles.passwordInput}
              />
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(text) => updatePasswordField("confirmPassword", text)}
                placeholder="새 비밀번호 확인"
                secureTextEntry
                autoCapitalize="none"
                style={styles.passwordInput}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={closePasswordModal}
                style={[styles.modalBtn, styles.modalBtnCancel]}
                disabled={passwordSaving}
              >
                <Text style={styles.modalBtnTextCancel}>취소</Text>
              </Pressable>

              <Pressable
                onPress={handlePasswordChange}
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                disabled={passwordSaving}
              >
                <Text style={styles.modalBtnTextConfirm}>
                  {passwordSaving ? "변경 중..." : "변경"}
                </Text>
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
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingLeft: 8,
    paddingRight: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  saveButton: {
    backgroundColor: Colors.light.primaryStrong,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#262626",
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  list: {
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
  },
  passwordButton: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  passwordButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
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
    color: Colors.light.primaryStrong,
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
  helperText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 13,
    color: "#8A8A8A",
    fontWeight: "500",
  },
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
  passwordFieldList: {
    width: "100%",
    gap: 10,
    marginBottom: 24,
  },
  passwordInput: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111",
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#e4e4e4",
  },
  modalBtnConfirm: {
    backgroundColor: "#D99197"
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