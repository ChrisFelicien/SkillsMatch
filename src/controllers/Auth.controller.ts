import { Request, Response, NextFunction, CookieOptions } from "express";
import catchAsync from "@/utils/catchAsyncError";
import AuthService from "@/services/Auth.service";
import config from "@/config/env";

const cookiesOptions: CookieOptions = {
  secure: config.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "strict"
};

class AuthController {
  register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // create new user
      const { user, accessToken, refreshToken } = await AuthService.register(
        req.body
      );

      res.cookie("refreshToken", refreshToken, {
        ...cookiesOptions,
        maxAge: config.COOKIE_EXPIRE_IN
      });

      res.status(201).json({
        status: "success",
        token: accessToken,
        data: {
          user
        }
      });
    }
  );

  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      const { user, accessToken, refreshToken } = await AuthService.login(
        email,
        password
      );

      res.cookie("refreshToken", refreshToken, {
        ...cookiesOptions,
        maxAge: config.COOKIE_EXPIRE_IN
      });

      res.status(200).json({
        status: "success",
        token: accessToken,
        data: {
          user
        }
      });
    }
  );
}

export default new AuthController();
