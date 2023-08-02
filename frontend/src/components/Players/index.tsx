import { SocketContext } from "@/contexts/socket.context";
import { Player } from "@/models/Users";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";
interface PlayerAvatar extends Player {
    isOnline: boolean
}
export default function Players() {
    const [players, setPlayers] = useState<PlayerAvatar[]>([])
    const { socket } = useContext(SocketContext)!;

    useEffect(() => {
        if (!socket) return
        socket.on("user_joined", (payload) => {
            const obj = JSON.parse(payload)
            toast(obj.message)
            const foundUser = players.find(x => x.user.email === obj.user.email)
            if (!foundUser) setPlayers(m => [...m, { ...obj.user, isOnline: true }]);
            else {
                foundUser.isOnline = true;
                setPlayers(m => [...players])
            }
        });
        socket.on("load_players", (payload) => {
            const players = JSON.parse(payload)
            setPlayers(players)
        })
        socket.on("quit", (payload) => {
            const user = JSON.parse(payload)
            const playerFound = players.find(player => player.user.email === user.email)
            if (!playerFound) return
            playerFound.isOnline = false
            setPlayers(m => [...players])
        })
    });
    return <div className="flex gap-2">
        {players.map(players => <span className={twMerge("p-2 text-black", players.isOnline ? "bg-green-500" : 'bg-green-200')} key={players.user?.email}>{players.user?.name}</span>)}
    </div>

}