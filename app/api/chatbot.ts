import api, { get, post } from "./index";
import { getAccessTokenFromStorage } from "../utils/asyncStorage";

export type ChatbotApiRole = "USER" | "MODEL";

export type ChatbotApiMessage = {
  role: ChatbotApiRole;
  content: string;
  timestamp: string;
};

export type ChatbotSession = {
  sessionId: string;
  title: string;
  messages: ChatbotApiMessage[];
  createdAt: string;
  lastActiveAt: string;
};

type ChatbotSessionResponse = ChatbotSession | ChatbotSession[];

export type CreateChatbotSessionRequest = {
  title?: string;
};

export type StreamChatbotMessageRequest = {
  message: string;
};

export type DeleteChatbotSessionResponse = {
  message: string;
};

type StreamChatbotMessageOptions = {
  sessionId: string;
  message: string;
  signal?: AbortSignal;
  onChunk?: (nextText: string, incomingText: string) => void;
};

const getBaseUrl = () =>
  api.defaults.baseURL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

const normalizeSession = (payload: ChatbotSessionResponse) => {
  const session = Array.isArray(payload) ? payload[0] : payload;

  if (!session) {
    throw new Error("Chatbot session response is empty.");
  }

  return session;
};

const resolveStreamText = (payload: unknown): string => {
  if (typeof payload === "string") {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;
  const candidate =
    record.text ??
    record.content ??
    record.message ??
    record.delta ??
    record.answer;

  if (typeof candidate === "string") {
    return candidate;
  }

  if (candidate && typeof candidate === "object") {
    return resolveStreamText(candidate);
  }

  return "";
};

const mergeStreamText = (previousText: string, incomingText: string) => {
  if (!incomingText) {
    return previousText;
  }

  if (incomingText.startsWith(previousText)) {
    return incomingText;
  }

  if (previousText.endsWith(incomingText)) {
    return previousText;
  }

  return `${previousText}${incomingText}`;
};

const consumeEventPayload = (
  payload: string,
  currentText: string,
  onChunk?: (nextText: string, incomingText: string) => void
) => {
  const trimmed = payload.trim();
  if (!trimmed || trimmed === "[DONE]") {
    return currentText;
  }

  let nextChunk = trimmed;

  try {
    nextChunk = resolveStreamText(JSON.parse(trimmed)) || trimmed;
  } catch {
    nextChunk = trimmed;
  }

  const nextText = mergeStreamText(currentText, nextChunk);
  if (nextText !== currentText) {
    onChunk?.(nextText, nextChunk);
  }

  return nextText;
};

const processSseBuffer = (
  buffer: string,
  currentText: string,
  onChunk?: (nextText: string, incomingText: string) => void
) => {
  let nextBuffer = buffer;
  let nextText = currentText;

  while (true) {
    const separatorIndex = nextBuffer.indexOf("\n\n");
    if (separatorIndex === -1) {
      break;
    }

    const rawEvent = nextBuffer.slice(0, separatorIndex);
    nextBuffer = nextBuffer.slice(separatorIndex + 2);

    const dataLines = rawEvent
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());

    if (dataLines.length === 0) {
      continue;
    }

    nextText = consumeEventPayload(dataLines.join("\n"), nextText, onChunk);
  }

  return { nextBuffer, nextText };
};

export const createChatbotSession = async (payload?: CreateChatbotSessionRequest) => {
  const response = await post<ChatbotSessionResponse>("/api/chatbot/sessions", payload ?? {});
  return normalizeSession(response.data);
};

export const fetchChatbotSessions = async () => {
  const response = await get<ChatbotSession[]>("/api/chatbot/sessions");
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchChatbotSession = async (sessionId: string) => {
  const response = await get<ChatbotSessionResponse>(`/api/chatbot/sessions/${sessionId}`);
  return normalizeSession(response.data);
};

export const deleteChatbotSession = async (sessionId: string) => {
  const response = await api.delete<DeleteChatbotSessionResponse>(
    `/api/chatbot/sessions/${sessionId}`
  );
  return response.data;
};

export const streamChatbotMessage = async ({
  sessionId,
  message,
  signal,
  onChunk,
}: StreamChatbotMessageOptions) => {
  const accessToken = await getAccessTokenFromStorage();
  const response = await fetch(`${getBaseUrl()}/api/chatbot/sessions/${sessionId}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ message } satisfies StreamChatbotMessageRequest),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chatbot stream error: ${response.status} ${errorText}`);
  }

  if (!response.body || !("getReader" in response.body)) {
    const rawText = await response.text();
    const { nextText } = processSseBuffer(rawText, "", onChunk);
    return nextText;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let accumulatedText = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      buffer += decoder.decode();
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const processed = processSseBuffer(buffer, accumulatedText, onChunk);
    buffer = processed.nextBuffer;
    accumulatedText = processed.nextText;
  }

  if (buffer.trim()) {
    accumulatedText = consumeEventPayload(buffer, accumulatedText, onChunk);
  }

  return accumulatedText;
};