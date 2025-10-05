"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/socket.context";
import Message from "./message";

import styles from "@styles/Chat.module.scss";
import { useTranslation } from "react-i18next";

type MessageType = {
  message: string;
  name: string;
};
interface ChatProps {
  roomHash: string;
  isOpen?: boolean;
}
export default function Chat({ roomHash }: ChatProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation()
  const divRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const { socket } = useSocket();
  const [localMessages, setMessages] = useState<MessageType[]>([]);
  const [useAutoScroll] = useState<boolean>(true);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [, setUnreadMessages] = useState<number>(0);

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
          message: t("ServerMessages.infos.PLAYER_JOINED", {
            player: message.message
          }),
        })
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
      Object.keys(events).forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket]);

  useEffect(() => {
    if (!useAutoScroll) return;
    divRef.current!.scroll({
      behavior: "smooth",
      top: divRef.current!.scrollHeight,
    });
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
    <div
      className={styles.Chat}
      ref={chatRef}
      onFocus={setReadMessages}>
      <div
        ref={divRef}
        className={styles.messagesContainer}>
        {isLoading && <span className="text-white">Loading...</span>}
        {!isLoading &&
          localMessages?.map((m, i) => (
            <Message
              key={`message-${i}`}
              {...m}
            />
          ))}
      </div>
      <form className={styles.messageForm}>
        <div className={styles.messageBox}>
          <input
            ref={inputRef}
            placeholder={t("chatPlaceholder")}
            type="text"
          />
        </div>
        <button
          onClick={(e) => sendMessage(e)}>
          {t("send")}
        </button>
      </form>
    </div >
  );
}
