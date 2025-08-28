import express from "express";
import {clientSignup, artistSignup, login, logout,forgotPassword,resetPassword,sendOtp,verifyOtp ,getProfile} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import parser from "../middleware/upload.js";


const router = express.Router();

router.post("/clientSignup", clientSignup);
router.post(
  "/artistSignup",
  parser.fields([
    { name: "citizenshipImage", maxCount: 1 },
    { name: "livePhoto", maxCount: 1 },
    { name: "guardianInfo[idDocument]", maxCount: 1 },
  ]),
  artistSignup
);

router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);




export default router;  