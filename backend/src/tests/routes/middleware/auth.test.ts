import request from "supertest";
import { app } from "@/app";
import { signAccessToken } from "@/lib/jwt";

const PROTECTED_ROUTE = "/api/v1/auth/protected";

const guestUser = {
  id: "guest-test-id",
  email: "guest@test.com",
  name: "User",
  role: "guest" as const,
  rank: 0,
  room: "",
  status: "not_ready",
  isRegistered: false,
};

jest.mock("@/lib/redis/guests", () => ({
  getGuest: jest.fn().mockResolvedValue({
    id: "guest-test-id",
    email: "guest@test.com",
    name: "User",
    role: "guest",
    rank: 0,
    room: "",
    status: "not_ready",
    isRegistered: false,
  }),
  touchGuest: jest.fn().mockResolvedValue(undefined),
}));

describe("Protected Route", () => {
  const validToken = signAccessToken({ id: guestUser.id, role: "guest" });

  it("should return 200 if valid JWT is provided", async () => {
    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", `Bearer ${validToken}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Welcome to the protected route");
    expect(response.body.user).toMatchObject({
      id: guestUser.id,
      name: guestUser.name,
    });
  });

  it("should return 401 if no JWT is provided", async () => {
    const response = await request(app).get(PROTECTED_ROUTE);
    expect(response.status).toBe(401);
    expect(["NOT_AUTHORIZED", "NO_TOKEN_PROVIDED"]).toContain(
      response.body.message
    );
  });

  it("should return 401 if invalid JWT is provided", async () => {
    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("NOT_AUTHORIZED");
  });
});
