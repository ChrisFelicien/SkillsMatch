import { connect, closeDbConnection, clearData } from "@/tests/DBHandler";
import { makeUser } from "@/tests/Factories/UserFactories";
import User from "@/models/User.model";

beforeAll(async () => await connect());
afterEach(async () => await clearData());
afterAll(async () => closeDbConnection());

describe("Auth test user model", () => {
  it("Should create user with hashed password", async () => {
    const data = makeUser({ password: "newPassword" });
    const user = await User.create(data);

    expect(user.password).not.toBe("newPassword");
  });

  it("Should fail when email is invalid", async () => {
    const data = makeUser({ email: "invalidEmail" });

    await expect(User.create(data)).rejects.toThrow();
  });

  it("Should send true if the password is correct", async () => {
    const user = await User.create(makeUser());
    const isMatch = await user.comparePassword("Password1234!");

    expect(isMatch).toBe(true);
  });

  it("Should return false if the is issued after changing password", async () => {
    const user = await User.create(makeUser());
    const dateIat = Date.now() - 1000;
    const isAfterPasswordChanging = user.passwordChangedAfter(dateIat);

    expect(isAfterPasswordChanging).toBe(false);
  });

  it("Should return true when password has been changed after jwt issued", async () => {
    const dateIat = Math.floor(Date.now() / 1000) - 10; // JWT issued now
    const user = await User.create(makeUser());

    user.passwordChangedAt = new Date();

    await user.save();

    expect(user.passwordChangedAt).toBeDefined();
    expect(user.passwordChangedAfter(dateIat)).toBe(true);
  });
});
