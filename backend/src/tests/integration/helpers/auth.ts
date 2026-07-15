import request from "supertest";
import type { Server } from "node:http";

export type GuestAuthResult = {
  accessToken: string;
  id: string;
  name: string;
};

export async function authenticateGuest(
  httpServer: Server,
  username = "integration-guest"
): Promise<GuestAuthResult> {
  const response = await request(httpServer)
    .post("/api/v1/auth/guest")
    .send({ username, skin: "8bit", avatar: "/avatar.png" });

  expect(response.status).toBe(200);
  expect(response.body.accessToken).toEqual(expect.any(String));

  return {
    accessToken: response.body.accessToken,
    id: response.body.id,
    name: response.body.name,
  };
}

export async function createRoomViaApi(
  httpServer: Server,
  accessToken: string,
  payload: {
    name: string;
    size: number;
    rule: "CarteadoGameRules" | "TrucoGameRules";
  }
) {
  const response = await request(httpServer)
    .post("/api/v1/rooms")
    .set("Authorization", `Bearer ${accessToken}`)
    .send(payload);

  expect(response.status).toBe(201);
  return response.body as {
    hash: string;
    name: string;
    size: number;
    rule: string;
    participants: unknown[];
  };
}
