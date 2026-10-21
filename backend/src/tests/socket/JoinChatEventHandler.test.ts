import { CHANNEL } from "shared/socket";
import { socketTestSetup } from "./socket.setup";
import { closeSockets, createTestSocket } from "./utils";

jest.mock("@/socket/events/chat/addMessage", () => ({
  addMessage: jest.fn(),
}));
jest.mock("@/lib/redis/chat", () => ({
  getMessages: jest.fn().mockResolvedValue([
    {
      name: "system",
      message: "Welcome to the chat!",
    },
  ]),
}));

describe("JoinChatEventHandler - integration", () => {
  const { getPort } = socketTestSetup();
  it("user should be able to join in chat and receive the messages", async () => {
    const port = getPort();
    const socket = createTestSocket("valid-token", port);

    const messages = await new Promise<unknown[]>((resolve) => {
      socket.on("load_messages", resolve);
      socket.on("connect", () => {
        socket.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
      });
    });
    closeSockets(socket);

    expect(messages.length).toBe(1);
  });

  it("should notify user A when user B joins the same room", async () => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    const socketB = createTestSocket("userB-valid-token", port);
    let socketAReady = false;
    let socketBReady = false;

    const payload = await new Promise<unknown>((resolve) => {
      const joinAsB = () => {
        if (!socketAReady || !socketBReady) return;
        socketB.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
      };

      socketA.on("join_chat", resolve);

      socketA.on("connect", () => {
        socketA.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
      });

      socketA.once("load_messages", () => {
        socketAReady = true;
        joinAsB();
      });

      socketB.on("connect", () => {
        socketBReady = true;
        joinAsB();
      });
    });
    closeSockets(socketA, socketB);

    expect(payload).toMatchObject({
      name: "system",
      message: "userB-valid-token",
    });
  });

  it("should be able to send and receive messages", async () => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    const socketB = createTestSocket("userB-valid-token", port);
    let socketAReady = false;
    let socketBReady = false;

    const payload = await new Promise<unknown>((resolve) => {
      const sendMessage = () => {
        if (!socketAReady || !socketBReady) return;
        socketB.emit("send_message", {
          roomHash: "room-test",
          message: "Message",
        });
      };

      socketA.on("receive_message", resolve);

      socketA.on("connect", () => {
        socketA.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
      });

      socketA.once("load_messages", () => {
        socketAReady = true;
        sendMessage();
      });

      socketB.on("connect", () => {
        socketB.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
      });

      socketB.once("load_messages", () => {
        socketBReady = true;
        sendMessage();
      });
    });
    closeSockets(socketA, socketB);

    expect(payload).toMatchObject({
      name: "userB-valid-token",
      message: "Message",
    });
  });
});
