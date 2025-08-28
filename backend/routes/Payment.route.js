import express from "express";
import { createPaypalOrder, capturePaypalPayment, getPaymentReceipt  } from "../controllers/Payment.controller.js";

const router = express.Router();

router.post("/paypal/create", createPaypalOrder);
router.get("/paypal/capture", capturePaypalPayment);

router.get("/receipt/:paymentId", getPaymentReceipt);

export default router;
