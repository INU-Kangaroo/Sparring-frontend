import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ChatbotApiMessage,
  ChatbotSession,
  createChatbotSession,
  deleteChatbotSession,
  fetchChatbotSession,
  fetchChatbotSessions,
  streamChatbotMessage,
} from "../api/chatbot";

type Role = "user" | "bot";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
};

const BOT_NAME = "Sparring 챗봇";

const FAQ_LIST = [
  "식후 혈당 관리에 도움이 되는 식사 원칙을 알려줘",
  "혈당 기록을 읽는 기본 방법을 설명해줘",
  "식후 걷기가 왜 도움이 되는지 알려줘",
  "혈당 측정 시점별 차이를 설명해줘",
  "저혈당이 의심될 때 확인할 점을 정리해줘",
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "seed-1",
  role: "bot",
  text: "안녕하세요. 혈당 관리와 기록 확인에 필요한 설명을 도와드릴게요.",
  createdAt: Date.now() - 1000,
};

const mapApiRoleToUiRole = (role: ChatbotApiMessage["role"]): Role =>
  role === "USER" ? "user" : "bot";

const toTimestamp = (value: string) => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

const toUiMessages = (messages: ChatbotApiMessage[]): ChatMessage[] => {
  if (messages.length === 0) {
    return [WELCOME_MESSAGE];
  }

  return messages.map((message, index) => ({
    id: `${message.role}-${message.timestamp}-${index}`,
    role: mapApiRoleToUiRole(message.role),
    text: message.content,
    createdAt: toTimestamp(message.timestamp),
  }));
};

const buildSessionTitle = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.length > 20 ? `${trimmed.slice(0, 20)}...` : trimmed;
};

const isMarkdownBlockLine = (line: string) =>
  /^(\s*[-*+]\s+|\s*\d+\.\s+|#{1,6}\s+|>\s+|```|\s{4,}|\t)/.test(line);

const normalizeMarkdownForDisplay = (text: string) => {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const lines = normalized.split("\n");
  const output: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    output.push(paragraph.join(" ").replace(/\s{2,}/g, " ").trim());
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      if (output[output.length - 1] !== "") {
        output.push("");
      }
      continue;
    }

    if (isMarkdownBlockLine(line)) {
      flushParagraph();
      output.push(line);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();

  return output.join("\n").replace(/\n{3,}/g, "\n\n");
};

const getMarkdownStyles = (isBot: boolean) =>
  isBot
    ? {
        body: styles.leftMarkdownBody,
        paragraph: styles.markdownParagraph,
        strong: styles.leftMarkdownStrong,
        em: styles.leftMarkdownEm,
        list_item: styles.leftMarkdownListItem,
        bullet_list_icon: styles.leftMarkdownBody,
        bullet_list_content: styles.leftMarkdownListContent,
        ordered_list_icon: styles.leftMarkdownBody,
        ordered_list_content: styles.leftMarkdownListContent,
        code_inline: styles.leftMarkdownInlineCode,
        code_block: styles.leftMarkdownCodeBlock,
        fence: styles.leftMarkdownCodeBlock,
        blockquote: styles.leftMarkdownBlockquote,
        link: styles.leftMarkdownLink,
      }
    : {
        body: styles.rightMarkdownBody,
        paragraph: styles.markdownParagraph,
        strong: styles.rightMarkdownStrong,
        em: styles.rightMarkdownEm,
        list_item: styles.rightMarkdownListItem,
        bullet_list_icon: styles.rightMarkdownBody,
        bullet_list_content: styles.rightMarkdownListContent,
        ordered_list_icon: styles.rightMarkdownBody,
        ordered_list_content: styles.rightMarkdownListContent,
        code_inline: styles.rightMarkdownInlineCode,
        code_block: styles.rightMarkdownCodeBlock,
        fence: styles.rightMarkdownCodeBlock,
        blockquote: styles.rightMarkdownBlockquote,
        link: styles.rightMarkdownLink,
      };

export default function ChatAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const streamAbortControllerRef = useRef<AbortController | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending && !isInitializing,
    [input, isInitializing, isSending]
  );

  const faqVisible =
    !isInitializing &&
    !isSending &&
    messages.length === 1 &&
    messages[0]?.id === WELCOME_MESSAGE.id;

  useEffect(() => {
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages.length]);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const sessions = await fetchChatbotSessions();
        const latestSession = [...sessions].sort(
          (a, b) =>
            new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
        )[0];

        if (!latestSession) {
          return;
        }

        const sessionDetail = await fetchChatbotSession(latestSession.sessionId);
        if (!isMounted) {
          return;
        }

        applySession(sessionDetail);
      } catch (error) {
        console.log("Failed to initialize chatbot session", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
      streamAbortControllerRef.current?.abort();
    };
  }, []);

  const goBack = () => router.back();

  const applySession = (session: ChatbotSession) => {
    setSessionId(session.sessionId);
    setSessionTitle(session.title);
    setMessages(toUiMessages(session.messages));
  };

  const resetChatState = () => {
    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    setSessionId(null);
    setSessionTitle(null);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setIsSending(false);
  };

  const handleDeleteSession = () => {
    if (!sessionId || isSending || isInitializing) {
      return;
    }

    Alert.alert(
      "대화 삭제",
      "현재 대화를 삭제하고 처음 상태로 돌아갈까요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChatbotSession(sessionId);
              resetChatState();
            } catch (error) {
              console.log("Failed to delete chatbot session", error);
              Alert.alert(
                "삭제 실패",
                "대화를 삭제하지 못했어요. 잠시 후 다시 시도해주세요."
              );
            }
          },
        },
      ]
    );
  };

  const handleStartNewChat = () => {
    if (isSending || isInitializing) {
      return;
    }

    resetChatState();
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending || isInitializing) return;

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
      let activeSessionId = sessionId;

      if (!activeSessionId) {
        const createdSession = await createChatbotSession({
          title: buildSessionTitle(trimmed),
        });
        activeSessionId = createdSession.sessionId;
        setSessionId(createdSession.sessionId);
        setSessionTitle(createdSession.title);
      }

      const abortController = new AbortController();
      streamAbortControllerRef.current = abortController;

      const streamedText = await streamChatbotMessage({
        sessionId: activeSessionId,
        message: trimmed,
        signal: abortController.signal,
        onChunk: (nextText) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === loadingId
                ? {
                    ...message,
                    text: nextText || "…",
                    createdAt: Date.now(),
                  }
                : message
            )
          );
        },
      });

      if (!streamedText.trim()) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === loadingId
              ? {
                  ...message,
                  text: "응답이 비어 있어요. 잠시 후 다시 시도해주세요.",
                  createdAt: Date.now(),
                }
              : message
          )
        );
      }

      try {
        const refreshedSession = await fetchChatbotSession(activeSessionId);
        applySession(refreshedSession);
      } catch (error) {
        console.log("Failed to refresh chatbot session", error);
      }
    } catch (e: any) {
      const errorMessage =
        e?.response?.status === 401 || e?.message?.includes("401")
          ? "로그인이 필요해요. 다시 로그인한 뒤 챗봇을 이용해주세요."
          : "지금은 답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, text: errorMessage }
            : m
        )
      );
      console.log("Failed to send chatbot message", e);
    } finally {
      streamAbortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const onSend = () => sendMessage(input);
  const onFaqPress = (q: string) => sendMessage(q);

  const renderMessageMarkdown = (text: string, isBot: boolean) => (
    <Markdown style={getMarkdownStyles(isBot)}>
      {normalizeMarkdownForDisplay(text)}
    </Markdown>
  );

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isBot = item.role === "bot";

    if (isBot) {
      return (
        <View style={styles.rowLeft}>
          <View style={styles.avatar}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 35, height: 40, borderRadius: 14 }}
              resizeMode="cover"
            />
          </View>

          <View style={styles.leftBubbleWrap}>
            <Text style={styles.botName}>{BOT_NAME}</Text>
            <View style={styles.bubbleLeft}>
              {renderMessageMarkdown(item.text, true)}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.rowRight}>
        <View style={styles.bubbleRight}>
          {renderMessageMarkdown(item.text, false)}
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
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{sessionTitle ?? BOT_NAME}</Text>
          <Text style={styles.headerSubtitle}>
            {isInitializing ? "대화 불러오는 중..." : "설명형 안내와 FAQ 중심으로 도와드려요"}
          </Text>
        </View>
        <Pressable
          onPress={handleStartNewChat}
          hitSlop={10}
          style={[
            styles.newChatBtn,
            (isSending || isInitializing) && styles.deleteBtnDisabled,
          ]}
          disabled={isSending || isInitializing}
        >
          <Ionicons name="add-circle-outline" size={20} color="#666" />
        </Pressable>
        <Pressable
          onPress={handleDeleteSession}
          hitSlop={10}
          style={[
            styles.deleteBtn,
            (!sessionId || isSending || isInitializing) && styles.deleteBtnDisabled,
          ]}
          disabled={!sessionId || isSending || isInitializing}
        >
          <Ionicons name="trash-outline" size={20} color="#666" />
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
              placeholder="궁금한 점을 설명형으로 물어보세요."
              placeholderTextColor="#B9B9B9"
              style={styles.input}
              multiline
              returnKeyType="send"
              onSubmitEditing={onSend}
              editable={!isSending && !isInitializing}
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
            <Ionicons name="send" size={18} color="#D99197" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#ffffff" },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTextWrap: { flex: 1, marginLeft: 4 },
  deleteBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  newChatBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnDisabled: {
    opacity: 0.35,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  headerSubtitle: { marginTop: 2, fontSize: 12, color: "#8C8C8C" },

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
    justifyContent: "center",
    alignItems: "center",
  },
  leftBubbleWrap: { maxWidth: "84%" },
  botName: { fontSize: 12, color: "#D99197", marginBottom: 6 },
  bubbleLeft: {
    backgroundColor: "#E7E7E7",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  leftMarkdownBody: { fontSize: 14, color: "#333", lineHeight: 22 },
  leftMarkdownStrong: { color: "#333", fontWeight: "700" },
  leftMarkdownEm: { color: "#333", fontStyle: "italic" },
  leftMarkdownListItem: { color: "#333", lineHeight: 22, marginTop: 2, marginBottom: 2 },
  leftMarkdownListContent: { color: "#333", lineHeight: 22, flexShrink: 1 },
  leftMarkdownInlineCode: {
    color: "#333",
    backgroundColor: "#DCDCDC",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  leftMarkdownCodeBlock: {
    color: "#333",
    backgroundColor: "#DCDCDC",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  leftMarkdownBlockquote: {
    color: "#333",
    borderLeftWidth: 3,
    borderLeftColor: "#C6C6C6",
    paddingLeft: 8,
  },
  leftMarkdownLink: { color: "#295EA8", textDecorationLine: "underline" },

  // 유저
  rowRight: { alignItems: "flex-end", marginBottom: 18 },
  bubbleRight: {
    maxWidth: "78%",
    backgroundColor: "#D99197",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rightMarkdownBody: { fontSize: 14, color: "#fff", lineHeight: 22 },
  rightMarkdownStrong: { color: "#fff", fontWeight: "700" },
  rightMarkdownEm: { color: "#fff", fontStyle: "italic" },
  rightMarkdownListItem: { color: "#fff", lineHeight: 22, marginTop: 2, marginBottom: 2 },
  rightMarkdownListContent: { color: "#fff", lineHeight: 22, flexShrink: 1 },
  rightMarkdownInlineCode: {
    color: "#fff",
    backgroundColor: "#C57C84",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  rightMarkdownCodeBlock: {
    color: "#fff",
    backgroundColor: "#C57C84",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rightMarkdownBlockquote: {
    color: "#fff",
    borderLeftWidth: 3,
    borderLeftColor: "#E9B3B7",
    paddingLeft: 8,
  },
  rightMarkdownLink: { color: "#FFF3DA", textDecorationLine: "underline" },
  markdownParagraph: { marginTop: 0, marginBottom: 8 },

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
    borderColor: "#F2F2F2",
    shadowColor: "#D99197",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  faqBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D99197",
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
