import express from "express";
import { getArtistMatches,GetArtistProfile } from "../../controllers/artistSide/ArtistMatch.controller.js";

const router = express.Router();
router.post("/match-artists", getArtistMatches);
router.get("/client/artists/profile/:id", GetArtistProfile);
export default router;
