import { IUser } from "@/interfaces/IUser";

export const makeUser = (overrides?: Partial<IUser>) => {
  return {
    firstName: "John",
    lastName: "Doe",
    email: `test-${Math.random()}@email.com`,
    password: "Password1234!",
    location: {
      country: "DR Congo",
      city: "Lubumbashi"
    },
    role: "freelancer",
    ...overrides
  } as any;
};
