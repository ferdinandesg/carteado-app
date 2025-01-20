import { useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";

type MessageType = {
  message: string;
  name: string;
};

export default function Message({ message, name }: MessageType) {
  const { data } = useSession();

  return <div
    key={`message-${message}`}
    className={twMerge(
      "flex",
      data?.user?.name === name ? "flex-row-reverse" : "flex-row"
    )}
  >
    <div className="flex flex-col">
      <span
        className={twMerge(
          "p-2 rounded text-sm text-gray-800",
          data?.user?.name === name
            ? "bg-white"
            : "bg-gray-400 text-gray-800 "
        )}
      >
        {message}
      </span>
      <span className="text-xs text-gray-300">{name}</span>
    </div>
  </div>
}