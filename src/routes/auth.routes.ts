import express from "express";
import { register, login, getProfile } from "../controllers/auth.controller.js";
import { autenticarJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", autenticarJWT, getProfile);

export default router;
