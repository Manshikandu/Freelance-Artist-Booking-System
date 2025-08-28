import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getClientProfile, updateClientProfile } from '../controllers/ClientProfile.controller.js';

const router = express.Router();

router.get('/', getClientProfile); 

router.get('/get-profile', protectRoute, getClientProfile);

router.patch('/update-profile', protectRoute, updateClientProfile);

export default router;