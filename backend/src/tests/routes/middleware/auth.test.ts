import request from "supertest";
import { app } from "@/app";

const PROTECTED_ROUTE = "/api/v1/auth/protected";

jest.mock("@/lib/redis/guests", () => ({
  getGuest: jest.fn().mockResolvedValue({ id: 1, name: "User" }),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn().mockImplementation((token, _secret, callback) => {
    if (token === "valid-token") {
      callback(null, { id: 1, role: "guest" });
    } else {
      callback(new Error("Invalid token"), null);
    }
  }),
}));

describe("Protected Route", () => {
  it("should return 200 if valid JWT is provided", async () => {
    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", "Bearer valid-token");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Welcome to the protected route");
    expect(response.body.user).toMatchObject({ id: 1, name: "User" });
  });

  it("should return 401 if no JWT is provided", async () => {
    const response = await request(app).get(PROTECTED_ROUTE);
    expect(response.status).toBe(401);
    expect(["NOT_AUTHORIZED", "NO_TOKEN_PROVIDED"]).toContain(
      response.body.message
    );
  });

  it("should return 403 if invalid JWT is provided", async () => {
    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("INVALID_TOKEN");
  });
});
