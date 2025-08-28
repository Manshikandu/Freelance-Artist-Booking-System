import express from "express";
import { createOrGetConversation, getUserConversations } from "../controller/conversation.controller.js";

const router = express.Router();

router.post("/", createOrGetConversation);
router.get("/:userId", getUserConversations); 

export default router;
