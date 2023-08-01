import { SocketContext } from "../../@types/socket"
import prisma from "../../prisma";

export async function DisconnectingEventHandler(
    context: SocketContext,
): Promise<void> {
    const { socket } = context
    console.log(`Disconnected: ${socket.id}`);
    // socket.disconnect
}
