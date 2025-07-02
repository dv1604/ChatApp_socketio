import { Router } from "express";
import { aiChat } from "../controllers/aiChatController";

const router = Router();
router.post('/chat', aiChat);

export default router;