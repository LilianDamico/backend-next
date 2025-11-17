import { Router } from "express";
import {
  getAvaliacoes,
  createAvaliacao,
} from "../controllers/avaliacao.controller";

const router = Router();

router.get("/", getAvaliacoes);
router.post("/", createAvaliacao);

export default router;
