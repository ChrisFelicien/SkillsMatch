import request from "supertest";
import app from "@/app";

describe("Test routes integration", () => {
  it("Should test not found routes", async () => {
    const response = await request(app).post("/not-found");

    expect(response.status).toBe(404);
  });
});
