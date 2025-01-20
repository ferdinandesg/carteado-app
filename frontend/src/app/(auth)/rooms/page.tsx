"use client";
import SearchComponent from "@/components/Search";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import fetchRooms from "@/hooks/rooms/fetchRooms";

export default function Rooms() {
  const router = useRouter();
  const { data, isLoading } = fetchRooms();

  const goToRoom = (hash: string) => {
    try {
      router.push(`/room/${hash}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center bg-black bg-opacity-20 w-1/2 mx-auto">
      <div className="flex flex-col gap-2 w-full p-2">
        <SearchComponent />
        <div className="flex flex-col">
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            data?.map((room) => (
              <div
                onClick={() => goToRoom(room.hash)}
                className="flex p-2 bg-[#ffbb76] border-b border-black cursor-pointer justify-between"
                key={room.id}
              >
                <span className="text-gray-800">Sala: {room.hash.toUpperCase()}</span>
                <span>{room.name}</span>
                <span
                  className={twMerge(
                    "font-semibold",
                    room.status === "open" ? "text-green-600" : "text-red-800"
                  )}
                >
                  {room.status}
                </span>
                <span>Jogadores: {room.players.length}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
