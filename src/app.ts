import express from "express";
import AuthRoutes from "@/routes/v1/Aut.routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1/auth", AuthRoutes);

export default app;
