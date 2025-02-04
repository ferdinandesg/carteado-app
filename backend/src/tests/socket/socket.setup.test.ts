import http from "http";
import { Server } from "socket.io";
import SocketClass from "@socket/socket";

jest.mock("@routes/middlewares/auth", () => ({
  verifyJWTToken: jest.fn().mockImplementation((token: string) => {
    if (token.includes("valid-token")) {
      return {
        id: token,
        email: `${token}@test.com`,
        name: token,
        role: "user",
      };
    } else {
      return null;
    }
  }),
}));
export function socketTestSetup() {
  let ioServer: Server;

  beforeAll((done) => {
    const server = http.createServer();
    ioServer = SocketClass.init(server);
    server.listen(4000, () => {
      done();
    });
  });

  afterAll(() => {
    ioServer.close();
  });

  return { getIoServer: () => ioServer };
}
