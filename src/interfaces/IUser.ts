import { Document } from "mongoose";

export enum UserRoles {
  ADMIN = "admin",
  FREELANCER = "freelancer",
  CLIENT = "client"
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRoles;
  location: {
    country: string;
    city: string;
    timezone: string;
  };

  //   Freelancer data
  freelancerProfile: {
    title: string;
    bio: string;
    skills: string[];
    hourlyRate: number;
    portfolio: Array<{ url: string; title: string }>;
  };

  clientProfile: {
    companyName: string;
    website: string;
    paymentVerified: string;
  };

  createdAt: Date;
  updatedAt: Date;
  passwordChangedAt: Date;

  // methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  passwordChangedAfter(TokenIssuedAt: number): boolean;
  changePassword(newPassword: string): Promise<void>;
}
