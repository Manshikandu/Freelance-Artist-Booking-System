import express from "express";
import { getArtistMatches } from "../../controllers/artistSide/ArtistMatch.controller.js";

const router = express.Router();
router.post("/match-artists", getArtistMatches);
export default router;
