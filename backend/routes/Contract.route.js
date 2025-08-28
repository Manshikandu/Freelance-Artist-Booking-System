import express from 'express';
import { generateClientContract, signContractByArtist, getContractDetails, getSignedUrl } from '../controllers/Contract.controller.js';
import { verifytoken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/generate-client', verifytoken, generateClientContract);
router.post('/sign-artist', verifytoken, signContractByArtist);
router.get('/details/:bookingId', verifytoken, getContractDetails);

router.get('/signed-url/:publicId', getSignedUrl);

export default router;
