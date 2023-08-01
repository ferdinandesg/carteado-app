import { useContext, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";
import { SocketContext } from "@/contexts/socket.context";

type MessageType = {
  message: string;
  name: string;
};
interface ChatProps {
  roomId: string;
}
export default function Chat({ roomId }: ChatProps) {
  const { data } = useSession();
  const ref = useRef<HTMLInputElement | null>(null);
  const { socket } = useContext(SocketContext)!;
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    socket.on("receive_message", (message) => {
      console.log("received", message);
      setMessages((m) => [...m, message]);
    });
    socket.on("load_messages", (payload) => {
      setMessages(payload.messages);
      setLoading(false);
    });
  }, []);
  const sendMessage = () => {
    const message = ref.current!.value;
    socket?.emit("send_message", { roomId, message: message });
    ref.current!.value = "";
  };
  return (
    <div className="flex flex-col justify-between">
      <div className="flex flex-col gap-2 overflow-y-auto h-60 p-2">
        {isLoading ? (
          <span className="text-white">Loading...</span>
        ) : (
          messages.map((x, i) => (
            <div
              key={`message-${i}`}
              className={twMerge(
                "flex",
                data?.user?.name === x.name ? "flex-row-reverse" : "flex-row"
              )}
            >
              <span
                className={twMerge(
                  "p-2 rounded text-sm text-gray-800",
                  data?.user?.name === x.name ? "bg-white" : "bg-gray-400 text-gray-800 "
                )}
              >
                {x.message}
              </span>
            </div>
          ))
        )}
      </div>
      <input ref={ref} className="p-2 border mt-2" type="text" />
      <button
        className="p-2 bg-gray-300 text-sm"
        placeholder="Digite sua mensagem..."
        onClick={sendMessage}
      >
        Enviar
      </button>
    </div>
  );
}
