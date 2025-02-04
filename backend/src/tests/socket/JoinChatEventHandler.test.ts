import { CHANNEL } from "@socket/channels";
import { socketTestSetup } from "./socket.setup.test";
import { createTestSocket } from "./utils";
jest.mock("src/redis/chat", () => ({
  getMessages: jest.fn().mockResolvedValue([
    {
      name: "system",
      message: "Welcome to the chat!",
    },
  ]),
}));

describe("JoinChatEventHandler - integration", () => {
  socketTestSetup();

  it("user should be able to join in chat and receive the messages", (done) => {
    const socket = createTestSocket("valid-token");

    socket.on("load_messages", (messages) => {
      if (messages.length === 1) done();
    });
    socket.on("connect", () => {
      socket.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
    });
  });
  it("should notify user A when user B joins the same room", (done) => {
    const socketA = createTestSocket("userA-valid-token");
    const socketB = createTestSocket("userB-valid-token");

    socketA.on("connect", () => {
      socketA.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
    });

    socketB.on("connect", () => {
      socketB.emit(CHANNEL.CLIENT.JOIN_CHAT, { roomHash: "room-test" });
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
  });
});
