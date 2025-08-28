import express from 'express';
import Artist from '../models/Artist.model.js';
import {UpdateArtist,
        ArtistProfile,

        upload,
        getAllArtists
       
     } from '../controllers/Artist.controller.js';
const router = express.Router();


router.patch("/profile/:id", UpdateArtist);


router.get('/profile/:id', ArtistProfile);  


router.post('/upload-media', upload);   

router.get("/artists", getAllArtists);







router.get("/search", async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase() || "";

    if (!query) return res.json([]);

    const artists = await Artist.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { "location.city": { $regex: query, $options: "i" } },
      ],
    });


    const scored = artists
      .map((artist) => {
        let score = 0;
        const name = artist.username?.toLowerCase() || "";
        const category = artist.category?.toLowerCase() || "";
        const locationCity = artist.location?.city?.toLowerCase() || "";

        if (name.startsWith(query)) score += 3;
        else if (name.includes(query)) score += 2;

        if (category.includes(query)) score += 1;
        if (category.includes(query) || locationCity.includes(query)) score += 1;


        console.log(`Artist: ${artist.username}, Category: ${artist.category}, Score: ${score}`);
        return { ...artist.toObject(), score };
      })
      .filter((a) => a.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json(scored);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});


export default router;