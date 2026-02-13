import { IAuthResponse } from "@/interfaces/IAuthResponse";
import { IJwt } from "@/interfaces/IJwt";
import { IUser } from "@/interfaces/IUser";
import User from "@/models/User.model";
import AppError from "@/utils/AppError";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";

class AuthService {
  async register(userData: Partial<IUser>): Promise<IAuthResponse> {
    // verify if there's any user with this email
    if (!userData.email) throw new AppError("Email is required", 400);

    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }

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
