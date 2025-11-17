import { Router } from "express";
import {
  getClinicas,
  createClinica,
} from "../controllers/clinica.controller";

const router = Router();

router.get("/", getClinicas);
router.post("/", createClinica);

export default router;
