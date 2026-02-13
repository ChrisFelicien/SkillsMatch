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

describe("Zod validation - Auth routes", () => {
  it("Should fail to register with (400) if email is not valid format", async () => {
    const data = makeUser({ email: "invalid-format" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Invalid email format/);
  });

  it("Should fail to register (400) if the password too short", async () => {
    const data = makeUser({ password: "hello" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      /Password must be at least 8 characters/
    );
  });

  it("Should fail to register if the last name is not provided", async () => {
    const data = makeUser({ lastName: "" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Last name is too short/);
  });

  it("Should fail to register if the last name less than 2 characters", async () => {
    const data = makeUser({ lastName: "A" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Last name is too short/);
  });

  it("Should fail to register if the first name is not provided", async () => {
    const data = makeUser({ firstName: "B" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/First name is too short/);
  });

  it("Should fail to register if the first name less than 2 characters", async () => {
    const data = makeUser({ firstName: "A" });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/First name is too short/);
  });

  it("Should fail to register if the user role is not allowed", async () => {
    const data = makeUser({ role: "InvalidRoe" } as any);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
  });

  it("Should fail to register if location is missing", async () => {
    const data = makeUser({ location: {} } as any);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(data);

    expect(response.status).toBe(400);
  });

  it("Should fail login if email is missing", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      password: "Hello"
    });

    expect(response.status).toBe(400);
  });

  it("Should fail login if email is invalid format", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      password: "Hello",
      email: "invalid"
    });

    expect(response.status).toBe(400);
  });

  it("Should fail login if password is missing", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "hello@email.com"
    });

    expect(response.status).toBe(400);
  });
});
