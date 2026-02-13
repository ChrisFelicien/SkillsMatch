import { IAuthResponse } from "@/interfaces/IAuthResponse";
import { IJwt } from "@/interfaces/IJwt";
import { IUser } from "@/interfaces/IUser";
import User from "@/models/User.model";
import AppError from "@/utils/AppError";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";
import logger from "@/utils/logger";

class AuthService {
  async register(userData: Partial<IUser>): Promise<IAuthResponse> {
    const newUser = await User.create(userData);

    const accessToken = generateAccessToken({
      userId: newUser._id,
      role: newUser.role
    } as IJwt);

    const refreshToken = generateRefreshToken({
      userId: newUser._id
    } as IJwt);

    const userObj = newUser.toObject();
    delete userObj.password;

    logger.info("Account created", { id: userObj._id });

    return {
      user: userObj,
      accessToken,
      refreshToken
    };
  }

  async login(email: string, password: string): Promise<IAuthResponse> {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role
    } as IJwt);
    const refreshToken = generateRefreshToken({ userId: user._id } as IJwt);

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      accessToken,
      refreshToken
    };
  }
}

export default new AuthService();
