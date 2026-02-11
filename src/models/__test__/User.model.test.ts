import { connect, clearData, closeDbConnection } from "@/tests/DBHandler";
import User from "@/models/User.model";

beforeAll(async () => await connect());
afterEach(async () => await clearData());
afterAll(async () => await closeDbConnection());

const validUserData = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@email.com",
  password: "Hello1234@",
  location: {
    country: "DR Congo",
    city: "Lubumbashi"
  },
  role: "freelancer",
  freelancerProfile: {
    title: "Fullstack software developer",
    bio: "Lorem ipsum is the name given to the (mangled) Latin text commonly used in publishing as a meaningless placeholder, since around the 1960s. It allows designers to arrange the visual elements of a page of text, such as font and layout, without being distracted by the content.",
    skills: ["node", "react", "mongo", "mongoose"],
    hourlyRate: 10,
    portfolio: []
  }
};

describe("Auth test User model", () => {
  it("Should create user database", async () => {
    const user = await User.create(validUserData);

    expect(user.email).toBeDefined();
    expect(user.email).toBe(validUserData.email);
    expect(user.password).not.toBe(validUserData.password); // Test hashing password
  });

  it("Should fail when required field (ex: password) is missing", async () => {
    const invalidData: any = { ...validUserData };
    delete invalidData.password;

    await expect(User.create(invalidData)).rejects.toThrow();
  });

  it("Should check if the iat token is in past or not", async () => {
    const user = await User.create(validUserData);

    expect(user.passwordChangedAt).toBeFalsy();

    const oldIat = Math.floor(Date.now() / 1000) - 10000; // Simulate an old token issued in the past
    const newIat = Math.floor(Date.now() / 1000) + 1000; // Simulate a new token issued in the future

    user.passwordChangedAt = new Date(Date.now());

    await user.save();

    // Initially, the password has not been changed, so it should return false
    expect(user.passwordChangedAfter(oldIat)).toBe(true);
    expect(user.passwordChangedAfter(newIat)).toBe(false);
  });

  it("Should check if the provided password is correct", async () => {
    const user = await User.create(validUserData);

    const isMatch = await user.comparePassword(validUserData.password);
    const isWrongPassword = await user.comparePassword("HelloFromMe");

    expect(isMatch).toBe(true);
    expect(isWrongPassword).toBe(false);
  });

  it("Should return false when the password has never change", async () => {
    const user = await User.create(validUserData);
    const timestamp = Math.floor(Date.now() / 1000);

    expect(user.passwordChangedAfter(timestamp)).toBe(false);
  });
});
