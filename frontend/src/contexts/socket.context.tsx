import { ReactNode, createContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
type SocketContextProps = {
    socket: Socket,
    joinRoom: (roomId: string) => Promise<void>
}
export const SocketContext = createContext<SocketContextProps | null>(null);
export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket>()
    useEffect(() => {
        const instance = io("http://localhost:3001")
        setSocket(instance)
    }, [])

    const joinRoom = async (roomId: string) => {
        try {
            if (!socket) return
            const response = await socket?.emitWithAck("join_room", roomId)
            if (response.error) throw response.message
        } catch (error) {
            throw error
        }
    }
    return <SocketContext.Provider value={{ joinRoom, socket }} >
        {children}
    </SocketContext.Provider>
}