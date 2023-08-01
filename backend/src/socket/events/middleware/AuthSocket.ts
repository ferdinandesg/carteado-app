import { Socket } from 'socket.io'

const DEFAULT_USER = {
    email: "none@gmail.com",
    name: "none",
    image: ""
}

export async function Authentication(
    socket: any,
    next: Function,
): Promise<void> {
    try {
        const { user } = socket.handshake.query
        // const auth = await AuthenticationHelper(Authorization, Identification)
        socket.user = JSON.parse(user)
        socket.join(socket.user.email)
    } catch (err) {
        socket.user = DEFAULT_USER

    } finally {
        return next(null, true)
    }
}
