import { io } from "socket.io-client";
import { socketTestSetup } from "./socket.setup.test";

describe("Socket Class", () => {
  socketTestSetup();
  it("should connect to socket.io and authenticate", (done) => {
    const socket = io("http://localhost:4000/room", {
      path: "/carteado_socket",
      auth: { token: "valid-token" },
    });

    socket.on("connect", () => {
      expect(socket.connected).toBe(true);
      done();
    });
  });

  it("should reject socket connection if authentication fails", (done) => {
    const socket = io("http://localhost:4000/room", {
      path: "/carteado_socket",
      auth: { token: "invalid-token" },
    });

    socket.on("connect_error", (err) => {
      expect(err.message).toBe("Unauthorized");
      done();
    });

    socket.on("connect", () => {
      done.fail("Connection should have failed");
    });
  });
});
