// import express from "express";
// import {
//   getArtistsByCategory,
//   searchArtists,
// } from "../controllers/Artist.List.controller.js";
// const router = express.Router();

// router.get("/client/artists", getArtistsByCategory);

// router.get("/client/artists/search", searchArtists);

// export default router;



import express from "express";
import {
  getArtistsByCategory,
  searchArtists,
  getClientBookings, 
  GetArtistProfile
} from "../controllers/Artist.List.contoller.js";

const router = express.Router();

router.get("/", getArtistsByCategory);

router.get("/search", searchArtists);

router.get("/bookings/:clientId", getClientBookings);

router.get("/profile/:id", GetArtistProfile);

export default router;

