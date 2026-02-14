import { Request, Response, NextFunction, Router } from "express";
import { login, register } from "@/controllers/Auth.controller";
import { loginSchema, registerSchema } from "@/schemas/user.Schema";
import validateSchema from "@/middlewares/validate";
import { protect } from "@/middlewares/Auth.middleware";

const router = Router();

router.post("/login", validateSchema(loginSchema), login);
router.post("/register", validateSchema(registerSchema), register);
router.get(
  "/me",
  protect,
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    res.status(200).json({
      status: "success",
      message: "User profile",
      user
    });
  }
);

export default router;
