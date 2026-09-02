"use client";
import { FormEvent, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";

import ActionButton from "@/components/buttons/ActionButton";
import TextInput from "@/components/inputs/TextInput";
import { useRoomShell } from "@/contexts/roomShell.context";
import { useChatSocket } from "@/hooks/chat/useChatSocket";
import styles from "@/styles/Chat.module.scss";
import { testIds } from "@/tests/testIds";

import Message from "./message";

interface ChatProps {
  roomHash: string;
}

export default function Chat({ roomHash }: ChatProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const shell = useRoomShell();
  const isSheetOpen = shell?.isMobile && shell.activePanel === "chat";

  // No mobile o chat "em foco" é o sheet aberto; no desktop, o painel focado.
  const isSheetOpenRef = useRef(isSheetOpen);
  useEffect(() => {
    isSheetOpenRef.current = isSheetOpen;
  }, [isSheetOpen]);

  const isFocused = useCallback(
    () =>
      Boolean(isSheetOpenRef.current) ||
      document.activeElement === chatRef.current,
    []
  );
  const { messages, isLoading, sendMessage, markAsRead, unreadCount } =
    useChatSocket(roomHash, { isFocused });

  const setChatUnread = shell?.setChatUnread;
  useEffect(() => {
    setChatUnread?.(unreadCount);
  }, [setChatUnread, unreadCount]);

  useEffect(() => {
    if (isSheetOpen) markAsRead();
  }, [isSheetOpen, markAsRead]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    if (typeof container.scroll === "function") {
      container.scroll({ behavior: "smooth", top: container.scrollHeight });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input?.value) return;
    sendMessage(input.value);
    input.value = "";
  };

  return (
    <aside
      className={styles.Chat}
      ref={chatRef}
      data-testid={testIds.room.chat}
      onFocus={markAsRead}>
      <div
        ref={messagesRef}
        className={styles.messagesContainer}>
        {isLoading && (
          <span className={styles.loadingMessage}>{t("loading")}</span>
        )}
        {!isLoading &&
          messages.map((m, i) => (
            <Message
              key={`message-${i}`}
              name={m.name}
              message={m.message}
            />
          ))}
      </div>
      <form
        className={styles.messageForm}
        onSubmit={handleSubmit}>
        <TextInput
          ref={inputRef}
          type="text"
          placeholder={t("chatPlaceholder")}
          aria-label={t("chatPlaceholder")}
        />
        <ActionButton
          type="submit"
          size="sm"
          icon={<Send size={18} />}>
          {t("send")}
        </ActionButton>
      </form>
    </aside>
  );
}
