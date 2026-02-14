import { Router } from "express";
import { login, register } from "@/controllers/Auth.controller";
import { loginSchema, registerSchema } from "@/schemas/user.Schema";
import validateSchema from "@/middlewares/validate";

const router = Router();

router.post("/login", validateSchema(loginSchema), login);
router.post("/register", validateSchema(registerSchema), register);

export default router;
