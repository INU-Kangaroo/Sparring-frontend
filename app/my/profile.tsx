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
  Alert,
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
    Alert.alert("로그아웃", "로그아웃 되었습니다.");
    router.replace("/login"); // 프로젝트 라우트에 맞게 변경
  };

  const handleWithdraw = () => {
    Alert.alert("회원탈퇴", "정말 회원탈퇴 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: () => {
          Alert.alert("완료", "회원탈퇴가 처리되었습니다.");
          router.replace("/login");
        },
      },
    ]);
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

  // "기본 정보" 18pt semibold (+ 라벨 기준선 맞추고 싶으면 paddingLeft 같이)
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
    alignItems: "center"
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
});
