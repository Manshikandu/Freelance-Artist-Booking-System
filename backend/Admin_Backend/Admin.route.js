import express from 'express';
import { Adminlogin, refreshToken, getClientDetail, getArtistDetail ,getAdminDashboardData , getAllBookings,getAllSignedContracts,getUnverifiedArtists,verifyArtistById, getRecentVerifiedArtists} from './Admin.controller.js';
const router = express.Router();

router.post('/Adminlogin',  Adminlogin);
router.post('/admin/refresh-token', refreshToken);

router.get('/dashboard-data', getAdminDashboardData);
router.get('/Artists-detail', getArtistDetail);
router.get('/Clients-detail',getClientDetail);
router.get('/booking-detail',getAllBookings );
router.get('/signed-contracts',  getAllSignedContracts);

router.get("/unverified-artists", getUnverifiedArtists);
router.patch("/verify-artist/:id", verifyArtistById);
router.get("/recent-verified-artists",getRecentVerifiedArtists)

export default router;
