"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "@/contexts/socket.context";
import Message from "./message";

import styles from "@styles/Chat.module.scss";
import { Mic } from "lucide-react";
import classNames from "classnames";
import useRoomByHash from "@/hooks/rooms/useRoomByHash";
import Header from "./header";

type MessageType = {
  message: string;
  name: string;
};
interface ChatProps {
  roomId: string;
  isOpen?: boolean;
}
export default function Chat({ roomId }: ChatProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const { socket } = useSocket();
  const [localMessages, setMessages] = useState<MessageType[]>([]);
  const [useAutoScroll, setUseAutoScroll] = useState<boolean>(true);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  const updateMessages = (messages: MessageType | MessageType[]) => {
    console.log("Updating messages", messages);
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
    if (!socket) return;
    console.log("Joining chat", roomId);
    const events = {
      join_chat: (message: MessageType) => updateMessages(message),
      receive_message: (message: MessageType) => updateMessages(message),
      load_messages: (payload: MessageType[]) => {
        updateMessages(payload);
        setLoading(false);
      },
    };
    socket.emit("join_chat", { roomId });
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      console.log("Leaving chat", roomId);
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
    if (!socket) return;
    e.preventDefault();
    const message = inputRef.current?.value;
    if (!message) return;
    socket.emit("send_message", { roomId, message });
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
      <Header
        roomId={roomId}
        messageCount={unreadMessages}
      />
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
          <Mic
            size={48}
            className={classNames(
              styles.microphone,
              useAutoScroll && styles.active
            )}
            onClick={() => setUseAutoScroll(!useAutoScroll)}
          />
          <input
            ref={inputRef}
            type="text"
          />
        </div>
        <button
          placeholder="Digite sua mensagem..."
          onClick={(e) => sendMessage(e)}>
          Enviar
        </button>
      </form>
    </div>
  );
}
