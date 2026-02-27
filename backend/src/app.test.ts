import request from "supertest";
import { app } from "./app";

describe("App Setup", () => {
  it("should return 404 for a non-existent route", async () => {
    const response = await request(app).get("/a-route-that-does-not-exist");
    expect(response.status).toBe(404);
  });

  it("should have CORS headers present on OPTIONS request", async () => {
    const response = await request(app)
      .options("/")
      .set("Origin", "http://example.com");

    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });
});
