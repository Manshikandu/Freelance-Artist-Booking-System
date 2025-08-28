import express from 'express';
import { getArtistRecommendationsForClient } from '../../controllers/clientSide/Artist.Recom.controller.js';

const router = express.Router();


router.get('/:clientId', getArtistRecommendationsForClient);

export default router;
