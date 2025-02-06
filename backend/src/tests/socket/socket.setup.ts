import { AddressInfo } from "net";
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
  let httpServer: http.Server;
  let ioServer: Server;
  let port: number;

  beforeAll((done) => {
    httpServer = http.createServer();
    ioServer = SocketClass.init(httpServer);
    httpServer.listen(0, () => {
      port = (httpServer.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    ioServer.close();
    httpServer.close();
    done();
  });

  return {
    getIoServer: () => ioServer,
    getPort: () => port,
  };
}
