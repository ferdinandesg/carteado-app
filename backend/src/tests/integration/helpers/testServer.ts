import { AddressInfo } from "node:net";
import http from "node:http";
import { app } from "@/app";
import RedisClass from "@/lib/redis/client";
import { SocketServer } from "@/socket/socket";

export type IntegrationTestServer = {
  httpServer: http.Server;
  port: number;
  close: () => Promise<void>;
};

export async function createIntegrationTestServer(): Promise<IntegrationTestServer> {
  await RedisClass.getDataClient();

  const httpServer = http.createServer(app);
  new SocketServer(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, "127.0.0.1", () => resolve());
  });

  const address = httpServer.address() as AddressInfo;

  return {
    httpServer,
    port: address.port,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await RedisClass.disconnect();
    },
  };
}
