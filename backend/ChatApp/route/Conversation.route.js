import express from "express";
import { createOrGetConversation, getUserConversations } from "../controller/conversation.controller.js";

const router = express.Router();

router.post("/", createOrGetConversation); // create or return conversation
router.get("/:userId", getUserConversations); // get all user's conversations

export default router;
