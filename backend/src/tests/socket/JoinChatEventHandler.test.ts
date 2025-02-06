import { CHANNEL } from "@socket/channels";
import { socketTestSetup } from "./socket.setup";
import { createTestSocket } from "./utils";

jest.mock("@socket/events/chat/addMessage", () => ({
  addMessage: jest.fn(),
}));
jest.mock("src/redis/chat", () => ({
  getMessages: jest.fn().mockResolvedValue([
    {
      name: "system",
      message: "Welcome to the chat!",
    },
  ]),
}));

describe("JoinChatEventHandler - integration", () => {
  const { getPort } = socketTestSetup();
  it("user should be able to join in chat and receive the messages", (done) => {
    const port = getPort();
    const socket = createTestSocket("valid-token", port);

    socket.on("load_messages", (messages) => {
      try {
        expect(messages.length).toBe(1);
        done();
      } catch (err) {
        done(err);
      } finally {
        socket.close();
      }
    });

    socket.on("connect", () => {
      socket.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
    });
  });

  it("should notify user A when user B joins the same room", (done) => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    const socketB = createTestSocket("userB-valid-token", port);

    socketA.on("connect", () => {
      socketA.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
    });

    socketA.on("join_chat", (payload) => {
      try {
        expect(payload).toMatchObject({
          name: "system",
          message: "userB-valid-token",
        });
        done();
      } catch (err) {
        done(err);
      } finally {
        socketA.close();
        socketB.close();
      }
    });

    socketB.on("connect", () => {
      socketB.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
    });
  });
  it("should be able to send and receive messages", (done) => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    const socketB = createTestSocket("userB-valid-token", port);

    socketA.on("connect", () => {
      socketA.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
    });

    socketB.on("connect", () => {
      socketB.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
    });
    socketA.on("receive_message", (payload) => {
      try {
        expect(payload).toMatchObject({
          name: "userB-valid-token",
          message: "Message",
        });
        done();
      } catch (err) {
        done(err);
      } finally {
        socketA.close();
        socketB.close();
      }
    });

    socketB.emit("send_message", { roomHash: "room-test", message: "Message" });
  });
});
