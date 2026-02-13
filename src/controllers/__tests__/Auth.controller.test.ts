import request from "supertest";
import { connect, clearData, closeDbConnection } from "@/tests/DBHandler";
import app from "@/app";
import { makeUser } from "@/tests/Factories/UserFactories";

beforeAll(async () => await connect());
afterEach(async () => await clearData());
afterAll(async () => await closeDbConnection());

describe("Test Auth controller integration", () => {
  it("Should create user from valid routes and send cookie token", async () => {
    const data = makeUser();
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.data.user.email).toBeDefined();
    expect(response.body.data.user.password).toBe(undefined);

    // check if cookies are defined
    const cookies = response.get("Set-Cookie");

    expect(cookies).toBeDefined();
    expect(cookies![0]).toMatch(/refreshToken=/);
    expect(cookies![0]).toMatch(/HttpOnly/);
  });
  it("Should login user", async () => {
    const data = makeUser();
    await request(app).post("/api/v1/auth/register").send(data);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: data.email, password: data.password });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.token).toBeDefined();

    // check if cookies are set
    const cookies = response.get("Set-Cookie");

    expect(cookies).toBeDefined();
    expect(cookies![0]).toMatch(/refreshToken=/);
    expect(cookies![0]).toMatch(/HttpOnly/);
  });

  it("Should fail to register when email is not provided", async () => {
    const data = makeUser({ email: "" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
  });

  it("Should fail when email is used twice to register", async () => {
    const data = makeUser();
    await request(app).post("/api/v1/auth/register").send(data);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
  });

  it("Should fail to login when email is wrong", async () => {
    const data = makeUser();
    await request(app).post("/api/v1/auth/register").send(data);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "invalid@email.com", password: data.password });

    expect(response.status).toBe(401);
  });
  it("Should fail when user try to login with wrong password", async () => {
    const data = makeUser();
    await request(app).post("/api/v1/auth/register").send(data);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: data.email,
      password: "invalidPassword"
    });

    expect(response.status).toBe(401);
  });
});
