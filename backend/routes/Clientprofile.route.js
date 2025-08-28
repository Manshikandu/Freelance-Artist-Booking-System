import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getClientProfile, updateClientProfile } from '../controllers/ClientProfile.controller.js';

const router = express.Router();

// Allow GET by id query param, no auth needed for chat avatar
router.get('/', getClientProfile); // <-- add this line

router.get('/get-profile', protectRoute, getClientProfile);

router.patch('/update-profile', protectRoute, updateClientProfile);

export default router;