import { socketTestSetup } from "./socket.setup";
import { closeSockets, createTestSocket } from "./utils";
jest.mock("src/redis/client", () => {
  return {
    getDataClient: jest.fn().mockResolvedValue("mocked-redis-client"),
  };
});
describe("Socket Class", () => {
  const { getPort } = socketTestSetup();
  it("should connect to socket.io and authenticate", (done) => {
    const port = getPort();
    const socket = createTestSocket("valid-token", port);

    socket.on("connect", () => {
      expect(socket.connected).toBe(true);
      done();
      closeSockets(socket);
    });
  });

  it("should reject socket connection if authentication fails", (done) => {
    const port = getPort();
    const socket = createTestSocket("empty-token", port);

    socket.on("connect_error", (err) => {
      expect(err.message).toBe("Unauthorized");
      closeSockets(socket);
      done();
    });

    socket.on("connect", () => {
      done.fail("Connection should have failed");
    });
  });
});
