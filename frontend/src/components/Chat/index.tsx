"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/socket.context";
import Message from "./message";

import styles from "@/styles/Chat.module.scss";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import ActionButton from "@/components/buttons/ActionButton";
import TextInput from "@/components/inputs/TextInput";

type MessageType = {
  message: string;
  name: string;
};
interface ChatProps {
  roomHash: string;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}
export default function Chat({ roomHash }: ChatProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const tRef = useRef(t);
  const divRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const { socket } = useSocket();
  const [localMessages, setMessages] = useState<MessageType[]>([]);
  const [useAutoScroll] = useState<boolean>(true);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const updateMessages = (messages: MessageType | MessageType[]) => {
    setMessages((m) => [
      ...m,
      ...(Array.isArray(messages) ? messages : [messages]),
    ]);
    if (chatRef.current && document.activeElement !== chatRef.current) {
      setUnreadMessages(
        (un) => un + (Array.isArray(messages) ? messages.length : 1)
      );
    }
  };

  useEffect(() => {
    const events = {
      join_chat: (message: MessageType) => {
        updateMessages({
          name: "system",
          message: tRef.current("ServerMessages.infos.PLAYER_JOINED", {
            player: message.message,
          }),
        });
      },
      receive_message: (message: MessageType) => updateMessages(message),
      load_messages: (payload: MessageType[]) => {
        updateMessages(payload);
        setLoading(false);
      },
    };
    socket.emit("join_chat", { roomHash });
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, roomHash]);

  useEffect(() => {
    if (!useAutoScroll || !divRef.current) return;
    if (typeof divRef.current.scroll === "function") {
      divRef.current.scroll({
        behavior: "smooth",
        top: divRef.current.scrollHeight,
      });
    } else {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [localMessages, useAutoScroll]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    const message = inputRef.current?.value;
    if (!message) return;
    socket.emit("send_message", { roomHash, message });
    inputRef.current!.value = "";
  };

  const setReadMessages = () => {
    setUnreadMessages(0);
  };

  return (
    <aside
      className={styles.Chat}
      ref={chatRef}
      onFocus={setReadMessages}>
      <div
        ref={divRef}
        className={styles.messagesContainer}>
        {isLoading && (
          <span className={styles.loadingMessage}>{t("loading")}</span>
        )}
        {!isLoading &&
          localMessages?.map((m, i) => (
            <Message
              key={`message-${i}`}
              {...m}
            />
          ))}
      </div>
      <form
        className={styles.messageForm}
        onSubmit={sendMessage}>
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
