import { Types } from "mongoose";

export interface IJwt {
  userId: Types.ObjectId;
  role?: string;
  iat: number;
}
