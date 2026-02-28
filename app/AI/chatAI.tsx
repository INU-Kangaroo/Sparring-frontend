import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Role = "user" | "bot";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
};

const BOT_NAME = "챗봇 이름";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";

const FAQ_LIST = [
  "혈당이 높을 때 뭘 먹어야 해요?",
  "운동은 언제 하는 게 좋나요?",
  "저혈당 증상은 뭔가요?",
  "식후 혈당을 낮추는 방법은?",
  "혈당 측정은 하루 몇 번이 좋나요?",
];

export default function ChatAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed-1",
      role: "bot",
      text: "안녕하세요! 무엇을 도와드릴까요?",
      createdAt: Date.now() - 1000,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [faqVisible, setFaqVisible] = useState(true);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages.length]);

  const goBack = () => router.back();

  const callGemini = async (prompt: string) => {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API Key가 없어요. .env에 EXPO_PUBLIC_GEMINI_API_KEY를 설정해줘!");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") ?? "";
    return text.trim() || "음… 잠시만요. 다시 한 번 말해줄래요?";
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setFaqVisible(false);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    const loadingId = `b-loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: "bot", text: "…", createdAt: Date.now() },
    ]);

    try {
      const answer = await callGemini(trimmed);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, text: answer, createdAt: Date.now() } : m
        )
      );
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, text: "지금은 답변을 가져오지 못했어요. 네트워크/키 설정을 확인해줘!" }
            : m
        )
      );
      console.log(e?.message ?? e);
    } finally {
      setIsSending(false);
    }
  };

  const onSend = () => sendMessage(input);
  const onFaqPress = (q: string) => sendMessage(q);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isBot = item.role === "bot";

    if (isBot) {
      return (
        <View style={styles.rowLeft}>
          <View style={styles.avatar} />
          <View style={styles.leftBubbleWrap}>
            <Text style={styles.botName}>{BOT_NAME}</Text>
            <View style={styles.bubbleLeft}>
              <Text style={styles.leftText}>{item.text}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.rowRight}>
        <View style={styles.bubbleRight}>
          <Text style={styles.rightText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            faqVisible ? (
              <View style={styles.faqSection}>
                <View style={styles.faqTitleRow}>
                  <Text style={styles.faqIcon}>💡</Text>
                  <Text style={styles.faqTitle}>자주 묻는 질문</Text>
                </View>
                {/* ✅ 세로로 쌓이는 버튼 */}
                <View style={styles.faqList}>
                  {FAQ_LIST.map((q, i) => (
                    <Pressable
                      key={i}
                      onPress={() => onFaqPress(q)}
                      style={({ pressed }) => [
                        styles.faqBtn,
                        pressed && { opacity: 0.75 },
                      ]}
                    >
                      <Text style={styles.faqBtnText}>{q}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* 하단 입력 */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="메시지를 입력하세요."
              placeholderTextColor="#B9B9B9"
              style={styles.input}
              multiline
              returnKeyType="send"
              onSubmitEditing={onSend}
              editable={!isSending}
            />
          </View>
          <Pressable
            onPress={onSend}
            disabled={!canSend}
            hitSlop={8}
            style={({ pressed }) => [
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled,
              pressed && canSend && { opacity: 0.9 },
            ]}
          >
            <Ionicons name="send" size={18} color="#CFCFCF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#F6F6F6" },

  header: { height: 54, justifyContent: "center", paddingHorizontal: 14 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },

  listContent: {
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  // 봇
  rowLeft: { flexDirection: "row", alignItems: "flex-start", marginBottom: 18 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DADADA",
    marginRight: 10,
    marginTop: 2,
  },
  leftBubbleWrap: { maxWidth: "78%" },
  botName: { fontSize: 12, color: "#8C8C8C", marginBottom: 6 },
  bubbleLeft: {
    backgroundColor: "#E7E7E7",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  leftText: { fontSize: 14, color: "#333", lineHeight: 20 },

  // 유저
  rowRight: { alignItems: "flex-end", marginBottom: 18 },
  bubbleRight: {
    maxWidth: "78%",
    backgroundColor: "#6FA8FF",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rightText: { fontSize: 14, color: "#fff", lineHeight: 20 },

  // FAQ 섹션 - 세로 나열
  faqSection: {
    marginTop: 8,
    marginBottom: 10,
  },
  faqTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  faqIcon: { fontSize: 15 },
  faqTitle: { fontSize: 14, fontWeight: "700", color: "#555" },

  faqList: {
    alignItems: "flex-start", // ✅ 오른쪽 정렬 (이미지처럼)
    gap: 8,
  },
  faqBtn: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E0E8FF",
    shadowColor: "#4060FF",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  faqBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3F7BFF",
  },

  // 입력 바
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 18 : 12,
    backgroundColor: "#F6F6F6",
  },
  inputWrap: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { fontSize: 14, color: "#222", maxHeight: 100 },
  sendBtn: {
    marginLeft: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
  },
  sendBtnDisabled: { opacity: 0.6 },
});