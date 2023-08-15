'use client'
import SearchComponent from "@/components/Search";
import useFetch from "@/hooks/useFetch"
import { Player } from "@/models/Users";
import { twMerge } from "tailwind-merge";
type RoomsInterface = {
    id: string;
    hash: string;
    name: string;
    status: "open" | "playing"
    createdAt: string
    players: Player[]
}
export default function Rooms() {
    const { data, isLoading } = useFetch<RoomsInterface[]>({ url: "http://localhost:3001/api/rooms", method: 'GET' })
    console.log({ data });

    return <div className="flex flex-col gap-2">
        <SearchComponent />
        <div className="flex flex-col w-1/2">
            {isLoading ? <span>Loading...</span> : data?.map(room => <div className="flex p-2 bg-[#ffbb76] border-b border-black cursor-pointer justify-between" key={room.id}>
                <span>Sala: {room.hash}</span>
                <span>{room.name}</span>
                <span className={twMerge("font-semibold", room.status === 'open' ? 'text-green-600' : "text-red-800")}>{room.status}</span>
                <span>Jogadores: {room.players.length}</span>
            </div>)}

        </div>
    </div>
}