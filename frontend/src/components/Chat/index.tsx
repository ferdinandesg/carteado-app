"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/socket.context";
import Message from "./message";

type MessageType = {
  message: string;
  name: string;
};
interface ChatProps {
  roomId: string;
}
export default function Chat({ roomId }: ChatProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const { socket } = useSocket();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!socket) return;
    socket?.emit("join_chat", { roomId });
    socket?.on("receive_message", (message) =>
      setMessages((m) => [...m, message])
    );
    socket?.on("load_messages", (payload) => {
      setMessages(payload);
      setLoading(false);
    });
    return () => {
      socket.off("receive_message");
      socket.off("load_messages");
    };
  }, [socket]);
  useEffect(() => {
    divRef.current!.scroll({
      behavior: "smooth",
      top: divRef.current!.scrollHeight,
    });
  }, [messages]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    const message = inputRef.current?.value;
    socket?.emit("send_message", { roomId, message });
    inputRef.current!.value = "";
  };
  return (
    <div className="flex flex-col justify-between">
      <div
        ref={divRef}
        className="flex flex-col gap-4 overflow-y-auto h-60 p-2"
      >
        {isLoading && <span className="text-white">Loading...</span>}
        {!isLoading && messages?.map((m, i) => <Message key={`message-${i}`} {...m} />)}

      </div>
      <form className="flex">
        <input ref={inputRef} className="p-2 border mt-2 w-full" type="text" />
        <button
          className="p-2 bg-gray-300 text-sm"
          placeholder="Digite sua mensagem..."
          onClick={(e) => sendMessage(e)}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
