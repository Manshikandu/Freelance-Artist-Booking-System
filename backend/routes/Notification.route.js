// routes/notification.routes.js
import express from "express";
import { getNotifications, markAsRead } from "../controllers/Notification.controller.js";
import { verifytoken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifytoken, getNotifications);
router.put("/:id/read", verifytoken, markAsRead);

export default router;
