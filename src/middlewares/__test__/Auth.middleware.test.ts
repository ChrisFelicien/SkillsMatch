import request from "supertest";
import { connect, clearData, closeDbConnection } from "@/tests/DBHandler";
import User from "@/models/User.model";
import { generateAccessToken } from "@/utils/jwt";
import app from "@/app";
import { makeUser } from "@/tests/Factories/UserFactories";

const invalidToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30`;

beforeAll(async () => await connect());
afterEach(async () => await clearData());
afterAll(async () => await closeDbConnection());

describe("Auth middleware - Protect middleware integration", () => {
  it("Should fail when token is not provided", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toContain(`No authorize token provided`);
  });

  it("Should fail when token is a empty string", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer");

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("No token provided");
  });

  it("Should fail if the token is invalid", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set(`Authorization`, `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toContain(
      "No valid token provided, Please login again"
    );
  });

  it("Should reject when user is no longer exist in database", async () => {
    const user = await User.create(makeUser());
    const token = generateAccessToken({
      userId: user._id,
      role: user.role
    } as any);
    await User.findByIdAndDelete(user._id);

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User no longer exist.");
  });

  it("Should refuse access when user has changed is password after token issued", async () => {
    const user = await User.create(makeUser());
    const token = generateAccessToken({
      userId: user._id,
      role: user.role
    } as any);

    user.passwordChangedAt = new Date(Date.now() + 10000);
    await user.save();

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Password was updated recently, please login again"
    );
  });

  it("Should successfully call next middleware", async () => {
    const user = await User.create(makeUser());
    const token = generateAccessToken({
      userId: user._id,
      role: user.role
    } as any);

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });
});
