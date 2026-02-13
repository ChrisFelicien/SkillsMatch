import AuthService from "@/services/Auth.service";
import { connect, clearData, closeDbConnection } from "@/tests/DBHandler";
import { makeUser } from "@/tests/Factories/UserFactories";

beforeAll(async () => await connect());
afterEach(async () => await clearData());
afterAll(async () => closeDbConnection());

describe("Test Auth service integration", () => {
  it("Should create valid user", async () => {
    const userData = makeUser();
    const { user, accessToken, refreshToken } =
      await AuthService.register(userData);

    expect(user.email).toBeDefined();
    expect(user.password).toBe(undefined);
    expect(refreshToken).toBeDefined();
    expect(accessToken).toBeDefined();
  });

  it("Should fail is the user email is used twice to create account", async () => {
    const data = makeUser();
    await AuthService.register(data);

    await expect(AuthService.register(data)).rejects.toThrow();
  });

  it("Should fail if the valid email is not provided", async () => {
    const data = makeUser({ email: "" });

    await expect(AuthService.register(data)).rejects.toThrow();
  });

  it("Should login a user with valid credentials", async () => {
    const data = makeUser();
    await AuthService.register(data);

    // login user
    const { user, accessToken, refreshToken } = await AuthService.login(
      data.email,
      data.password
    );

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(user.password).toBe(undefined);
  });

  it("Should fail if the provided password is wrong", async () => {
    const data = makeUser();
    await AuthService.register(data);

    await expect(
      AuthService.login(data.email, "InvalidPassword")
    ).rejects.toThrow("Invalid email or password");
  });

  it("Should fail if the provided email is wrong", async () => {
    await expect(
      AuthService.login("invalid@email.com", "password")
    ).rejects.toThrow("Invalid email or password");
  });
});
