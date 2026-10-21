import { AddressInfo } from "net";
import http from "http";
import { Server } from "socket.io";
import { SocketServer } from "@/socket/socket";

jest.mock("@/routes/middlewares/auth", () => ({
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

  beforeAll(async () => {
    httpServer = http.createServer();
    const socketServer = new SocketServer(httpServer);
    ioServer = socketServer.io;
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });
  });

  afterAll(() => {
    ioServer.close();
    httpServer.close();
  });

  return {
    getIoServer: () => ioServer,
    getPort: () => port,
  };
}
