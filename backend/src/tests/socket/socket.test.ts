import { socketTestSetup } from "./socket.setup";
import { closeSockets, createTestSocket } from "./utils";
jest.mock("@/lib/redis/client", () => ({
  default: {
    getDataClient: jest.fn().mockResolvedValue("mocked-redis-client"),
  },
}));
describe("Socket Class", () => {
  const { getPort } = socketTestSetup();
  it("should connect to socket.io and authenticate", async () => {
    const port = getPort();
    const socket = createTestSocket("valid-token", port);

    await new Promise<void>((resolve) => socket.on("connect", resolve));
    expect(socket.connected).toBe(true);
    closeSockets(socket);
  });

  it("should reject socket connection if authentication fails", async () => {
    const port = getPort();
    const socket = createTestSocket("empty-token", port);

    const err = await new Promise<Error>((resolve, reject) => {
      socket.on("connect_error", resolve);
      socket.on("connect", () =>
        reject(new Error("Connection should have failed"))
      );
    });
    expect(err.message).toBe("Unauthorized");
    closeSockets(socket);
  });
});
