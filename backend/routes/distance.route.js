// distanceRoute.js
import express from "express";
import { calculateDistance, getRoute} from "../controllers/distance.controller.js";

const router = express.Router();

router.post("/distance", calculateDistance);

router.post("/route", getRoute);

export default router;
