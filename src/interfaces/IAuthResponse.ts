import { IUser } from "@/interfaces/IUser";

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
