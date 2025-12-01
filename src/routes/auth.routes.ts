import express from "express";
import { register, login, getProfile } from "../controllers/auth.controller";
import { autenticarJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", autenticarJWT, getProfile);

export default router;
