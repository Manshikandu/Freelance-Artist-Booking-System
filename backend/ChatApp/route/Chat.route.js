// import express from "express";
// import {  getMessages } from "../controller/Chat.controller.js";

// const router = express.Router();

// // router.post("/send", sendMessage); // send message
// router.get("/:conversationId", getMessages); // get messages by conversation

// export default router;



import { Router } from "express";
import { getMessages, deleteMessage } from "../controller/Chat.controller.js";

const router = Router();

// Place the delete route BEFORE the get messages route!
router.delete("/message/:messageId", deleteMessage);
router.get("/:conversationId", getMessages);

export default router;