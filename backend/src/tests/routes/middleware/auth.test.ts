import { Server } from "http";
import request from "supertest";
import server from "src/index";

const PROTECTED_ROUTE = "/api/v1/auth/protected";

jest.mock("src/redis/guests", () => {
  return {
    getGuest: jest.fn().mockResolvedValue({ id: 1, name: "User" }),
  };
});

jest.mock("src/redis/client", () => {
  return {
    getDataClient: jest.fn(),
  };
});

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
  let httpServer: Server;

  beforeAll(() => {
    httpServer = server;
  });

  afterAll((done) => {
    httpServer.close(done);
  });

  it("should return 200 if valid JWT is provided", async () => {
    const response = await request(server)
      .get(PROTECTED_ROUTE)
      .set("Authorization", "Bearer valid-token");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Welcome to the protected route");
    expect(response.body.user).toEqual({ id: 1, name: "User" });
  });

  it("should return 401 if no JWT is provided", async () => {
    const response = await request(server).get(PROTECTED_ROUTE);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("NOT_AUTHORIZED");
  });

  it("should return 403 if invalid JWT is provided", async () => {
    const response = await request(server)
      .get(PROTECTED_ROUTE)
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("INVALID_TOKEN");
  });
});
