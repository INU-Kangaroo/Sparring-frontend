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

type CreateChatbotMessageResponse = {
  messageId?: string;
  id?: string;
  streamUrl?: string;
  streamPath?: string;
  message?: {
    messageId?: string;
    id?: string;
    streamUrl?: string;
    streamPath?: string;
  };
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

const unwrap = <T>(payload: any): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
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

const resolveMessageId = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") {
    throw new Error("메시지 생성 응답에서 messageId를 찾지 못했습니다.");
  }

  const record = payload as Record<string, unknown>;
  const nested = record.message && typeof record.message === "object"
    ? (record.message as Record<string, unknown>)
    : null;

  const candidates = [
    record.messageId,
    record.id,
    nested?.messageId,
    nested?.id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  throw new Error("메시지 생성 응답에서 messageId를 찾지 못했습니다.");
};

const resolveStreamUrl = (payload: unknown, messageId: string): string => {
  const defaultUrl = `${getBaseUrl()}/api/chatbot/streams/${messageId}`;

  if (!payload || typeof payload !== "object") {
    return defaultUrl;
  }

  const record = payload as Record<string, unknown>;
  const nested = record.message && typeof record.message === "object"
    ? (record.message as Record<string, unknown>)
    : null;

  const candidate =
    record.streamUrl ??
    record.streamPath ??
    nested?.streamUrl ??
    nested?.streamPath;

  if (typeof candidate !== "string" || !candidate.trim()) {
    return defaultUrl;
  }

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  return `${getBaseUrl()}${candidate.startsWith("/") ? candidate : `/${candidate}`}`;
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

const EVENT_SEPARATOR_REGEX = /\r?\n\r?\n/;

const processSseBuffer = (
  buffer: string,
  currentText: string,
  onChunk?: (nextText: string, incomingText: string) => void
) => {
  let nextBuffer = buffer;
  let nextText = currentText;

  while (true) {
    const separatorMatch = EVENT_SEPARATOR_REGEX.exec(nextBuffer);
    if (!separatorMatch || separatorMatch.index == null) {
      break;
    }

    const separatorIndex = separatorMatch.index;
    const separatorLength = separatorMatch[0].length;

    const rawEvent = nextBuffer.slice(0, separatorIndex);
    nextBuffer = nextBuffer.slice(separatorIndex + separatorLength);

    const dataLines = rawEvent
      .split(/\r?\n/)
      .map((line) => line.trimStart())
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
  return normalizeSession(unwrap<ChatbotSessionResponse>(response.data));
};

export const fetchChatbotSessions = async () => {
  const response = await get<ChatbotSession[]>("/api/chatbot/sessions");
  const payload = unwrap<ChatbotSession[] | ChatbotSessionResponse>(response.data);
  return Array.isArray(payload) ? payload : payload ? [payload] : [];
};

export const fetchChatbotSession = async (sessionId: string) => {
  const response = await get<ChatbotSessionResponse>(`/api/chatbot/sessions/${sessionId}`);
  return normalizeSession(unwrap<ChatbotSessionResponse>(response.data));
};

export const deleteChatbotSession = async (sessionId: string) => {
  const response = await api.delete<DeleteChatbotSessionResponse>(
    `/api/chatbot/sessions/${sessionId}`
  );
  return unwrap<DeleteChatbotSessionResponse>(response.data);
};

const createChatbotMessage = async ({
  sessionId,
  message,
}: {
  sessionId: string;
  message: string;
}) => {
  const response = await post<CreateChatbotMessageResponse>(
    `/api/chatbot/sessions/${sessionId}/messages`,
    { message } satisfies StreamChatbotMessageRequest
  );
  return unwrap<CreateChatbotMessageResponse>(response.data);
};

const stopChatbotStream = async ({
  messageId,
  accessToken,
}: {
  messageId: string;
  accessToken: string | null;
}) => {
  try {
    await fetch(`${getBaseUrl()}/api/chatbot/streams/${messageId}`, {
      method: "DELETE",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  } catch {
    // Best effort stop request
  }
};

export const streamChatbotMessage = async ({
  sessionId,
  message,
  signal,
  onChunk,
}: StreamChatbotMessageOptions) => {
  const accessToken = await getAccessTokenFromStorage();
  const created = await createChatbotMessage({ sessionId, message });
  const messageId = resolveMessageId(created);
  const streamUrl = resolveStreamUrl(created, messageId);

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let isSettled = false;
    let lastCursor = 0;
    let buffer = "";
    let accumulatedText = "";

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
      xhr.onprogress = null;
      xhr.onerror = null;
      xhr.onload = null;
      xhr.onreadystatechange = null;
      xhr.onabort = null;
    };

    const settleResolve = (value: string) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve(value);
    };

    const settleReject = (error: Error) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(error);
    };

    const processResponseDelta = () => {
      const fullText = xhr.responseText ?? "";
      if (fullText.length <= lastCursor) {
        return;
      }

      const delta = fullText.slice(lastCursor);
      lastCursor = fullText.length;

      buffer += delta;
      const processed = processSseBuffer(buffer, accumulatedText, onChunk);
      buffer = processed.nextBuffer;
      accumulatedText = processed.nextText;
    };

    const onAbort = () => {
      xhr.abort();
      void stopChatbotStream({ messageId, accessToken });
    };

    if (signal?.aborted) {
      void stopChatbotStream({ messageId, accessToken });
      settleReject(new Error("Chatbot stream aborted"));
      return;
    }

    signal?.addEventListener("abort", onAbort);

    xhr.open("GET", streamUrl, true);
    xhr.setRequestHeader("Accept", "text/event-stream");
    if (accessToken) {
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED && xhr.status >= 400) {
        console.log("[chatbot stream] headers error status =", xhr.status);
        settleReject(new Error(`Chatbot stream error: ${xhr.status} ${xhr.responseText ?? ""}`));
      }
    };

    xhr.onprogress = processResponseDelta;

    xhr.onload = () => {
      processResponseDelta();

      if (xhr.status >= 400) {
        console.log("[chatbot stream] onload error status =", xhr.status);
        console.log("[chatbot stream] onload error body =", xhr.responseText ?? "");
        settleReject(new Error(`Chatbot stream error: ${xhr.status} ${xhr.responseText ?? ""}`));
        return;
      }

      if (buffer.trim()) {
        const processedRemainder = processSseBuffer(
          `${buffer}\n\n`,
          accumulatedText,
          onChunk
        );
        accumulatedText = processedRemainder.nextText;
      }

      settleResolve(accumulatedText);
    };

    xhr.onabort = () => {
      settleReject(new Error("Chatbot stream aborted"));
    };

    xhr.onerror = () => {
      settleReject(new Error("Chatbot stream network error"));
    };

    xhr.send();
  });
};