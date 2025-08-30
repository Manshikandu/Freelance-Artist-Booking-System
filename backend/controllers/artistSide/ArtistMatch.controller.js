
//sat location
import Artist from "../../models/Artist.model.js"; 
import { cosineSimilarity } from "../../utils/CosineSimilarity.js";
import { haversine } from "../../utils/haversine.js";
const TAGS = [
  "musician", "dj", "singer", "dancer", "mc",
  "pop", "rock", "90s", "hip-hop",
  "solo", "band",
  "english", "nepali", "newari", "hindi",
  "wedding", "corporate", "concert"
];
const createVector = (tags) => TAGS.map(tag => tags.includes(tag.toLowerCase()) ? 1 : 0);
// Returns label string based on score thresholds
const getMatchLabel = (score) => {
  if (score >= 0.9) return "Best Match";
  if (score >= 0.75) return " Excellent Match";
  if (score >= 0.5) return " Good Match";
  return null;
};
const getArtistMatches = async (req, res) => {
  try {
    const { userLat, userLng, maxBudget, distanceLimit = 50, preferences = {}, categoryName } = req.body;
    
   
    if (!userLat || !userLng) {
      return res.status(400).json({ error: "User coordinates are required" });
    }

    const categoryFilter = categoryName
      ? { category: categoryName.toLowerCase() }
      : {};

    const artists = await Artist.find(categoryFilter).lean();
    
    if (artists.length === 0) {
      return res.status(200).json([]);
    }

    
    const preferenceTags = [
      ...(preferences.genres || []),
      ...(preferences.specialties || []),
      ...(preferences.languages || []),
      categoryName || ""
    ].map(t => t.toLowerCase());

    const userVector = createVector(preferenceTags);

    const scored = artists
      .filter(a => a.location?.coordinates?.length === 2)
      .map((artist) => {
        const [lng, lat] = artist.location.coordinates;
        const distance = haversine(userLat, userLng, lat, lng);
        return {
          ...artist,
          distance: Number(distance.toFixed(2))
        };
      })
      .filter(artist => artist.distance <= distanceLimit); 
    
    if (scored.length === 0) {
      return res.status(200).json([]);
    }
    
    const finalScored = scored.map((artist) => {
        const tags = [
          ...(artist.genres || []),
          ...(artist.specialties || []),
          ...(artist.languages || []),
          ...(artist.eventTypes || []),
          artist.category || ""
        ].map(t => t.toLowerCase());

        const artistVector = createVector(tags);
        const cosineScore = cosineSimilarity(userVector, artistVector);

        const normalizedDistance = Math.min(artist.distance / distanceLimit, 1); 

        const wage = artist.ratePerHour || artist.wage || 0;
        let priceScore = 1;
        
        if (maxBudget) {
          if (wage <= maxBudget) {
            const priceDiff = Math.abs(wage - maxBudget);
            priceScore = 1 - (priceDiff / maxBudget) * 0.3; 
          } else {
            priceScore = Math.max(0, 1 - (wage - maxBudget) / maxBudget);
          }
        }
        
        const priceWeight = maxBudget ? 0.25 : 0.1;
        const contentWeight = maxBudget ? 0.45 : 0.6;
        const distanceWeight = maxBudget ? 0.3 : 0.3;
        
        const finalScore = contentWeight * cosineScore + distanceWeight * (1 - normalizedDistance) + priceWeight * priceScore;

        console.log(` Artist Match Algorithm - ${artist.username || artist._id}:`);
        console.log(`   Content Score: ${cosineScore.toFixed(4)} (weight: ${contentWeight})`);
        console.log(`  Distance Score: ${(1 - normalizedDistance).toFixed(4)} (weight: ${distanceWeight}, distance: ${artist.distance}km)`);
        console.log(`   Price Score: ${priceScore.toFixed(4)} (weight: ${priceWeight}, rate: $${wage})`);
        console.log(`   Final Score: ${finalScore.toFixed(4)}`);
        console.log(`   Match Label: ${getMatchLabel(finalScore) || 'No Match'}`);
        console.log('  ─────────────────────────────────────');

        return {
          ...artist,
          score: Number(finalScore.toFixed(4)),
          matchLabel: getMatchLabel(finalScore)
        };
      });
    
    const ranked = finalScored
      .filter(a => a.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.distance - b.distance;
      });
      
    res.status(200).json(ranked);
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};
export { getArtistMatches };


export const GetArtistProfile = async(req, res) => {
    try{
        const artist = await Artist.findById(req.params.id);
        if(!artist)
        {
            return res.status(404).json({error: 'Not found'});
        }
        res.json(artist);
    }
    catch(error)
    {
        res.status(500).json({error: 'Fetch error'});
    }
};
