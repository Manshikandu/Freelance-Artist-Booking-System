import { Router } from "express";
import { getMessages, deleteMessage } from "../controller/Chat.controller.js";

const router = Router();

router.delete("/message/:messageId", deleteMessage);
router.get("/:conversationId", getMessages);

export default router;