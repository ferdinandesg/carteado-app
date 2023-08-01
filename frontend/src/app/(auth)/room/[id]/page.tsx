"use client";
import { GameContext } from "@/contexts/game.context";
import {
  TextareaHTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import UserCard from "@/components/UserCard";
import { SocketContext } from "@/contexts/socket.context";
import Game from "@/components/Game/game";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
type MessageType = {
  message: string;
  name: string;
};
const getRoom = async (hash: string) => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/rooms/join/${hash}`,
      { method: "POST" }
    );
    const room = await response.json();
    return room;
  } catch (error) {
    console.log({ error });
  }
};

export default function Room() {
  const { isLoading } = useContext(GameContext)!;
  const { socket } = useContext(SocketContext)!;
  const ref = useRef<HTMLInputElement | null>(null);
  const params = useParams();
  const roomId = String(params.id);
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    socket?.on("user_joined", (message) => toast(message));
    socket?.on("receive_message", (message) => setMessages((m) => [...m, message]));
    socket?.on("load_messages", (message) => console.log({ message }));
    socket?.emit("join_room", roomId);
    socket?.emit("join_chat", roomId);
    socket?.on("error", (user) => console.log("error", user));
  }, [socket]);

  const sendMessage = () => {
    const message = ref.current!.value;
    socket?.emit("send_message", { roomId, message: message });
    ref.current!.value = "";
  };
  if (!socket) return <div>Loading...</div>;
  return (
    <>
      {!isLoading ?? <Game />}
      <UserCard />

      <div className="flex flex-col">
        <div className="flex justify-between">
          {messages.map((x, i) => (
            <span key={`message-${i}`}>Mensagem</span>
          ))}
          <input ref={ref} className="p-2 border" type="text" />
          <button className="p-2 bg-gray-300" onClick={sendMessage}>
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}
