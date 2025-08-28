
import Booking from '../../models/Artist.Booking.model.js';
import Artist from '../../models/Artist.model.js';
import Review from '../../models/Review.model.js';

const computeArtistSimilarity = (a, b) => {
  let score = 0;

  if (a.category && b.category && a.category === b.category) score += 0.5;
  if (a.genres && b.genres) {
    const overlap = a.genres.filter(g => b.genres.includes(g)).length;
    score += 0.1 * overlap;
  }
  if (a.location?.city && b.location?.city && a.location.city === b.location.city) {
    score += 0.4;
  }
  if (a.weightedRating != null && b.weightedRating != null) {
    const avgRating = (a.weightedRating + b.weightedRating) / 2;
    const normalized = avgRating / 5;
    score += 0.3 * normalized;
  }
  return score;
};


const getCollaborativeRecommendations = async (limit = 10) => {
  try {
    const popularBookings = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['accepted', 'completed'] } 
        }
      },
      { 
        $group: { 
          _id: '$artist', 
          bookingCount: { $sum: 1 },
          completedCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
          }
        }
      },
      { 
        $lookup: {
          from: 'artists',
          localField: '_id',
          foreignField: '_id',
          as: 'artist'
        }
      },
      { $unwind: '$artist' },
      {
        $project: {
          artistId: '$_id',
          bookingCount: 1,
          completedCount: 1,
          weightedRating: '$artist.weightedRating',
          totalRatings: '$artist.totalRatings',

          collaborativeScore: {
            $add: [
              { $multiply: ['$bookingCount', 2] },
              { $multiply: ['$completedCount', 3] }, 
              { $multiply: [{ $ifNull: ['$artist.weightedRating', 3] }, '$artist.totalRatings'] } 
            ]
          }
        }
      },
      { $sort: { collaborativeScore: -1 } },
      { $limit: limit }
    ]);

    return popularBookings.map(item => ({
      artistId: item.artistId.toString(),
      score: item.collaborativeScore,
      reason: 'Popular among other users',
      algorithm: 'trending'
    }));
  } catch (error) {
    console.error('Error in collaborative recommendations:', error);
    return [];
  }
};

const getContentBasedRecommendations = async (clientId, limit = 10) => {
  const clientBookings = await Booking.find({ client: clientId }).select('artist').lean();
  const bookedArtistIds = [...new Set(clientBookings.map(b => b.artist.toString()))];

  if (bookedArtistIds.length === 0) {
    return [];
  }

  const bookedArtists = await Artist.find({ _id: { $in: bookedArtistIds } }).lean();
  const otherArtists = await Artist.find({ _id: { $nin: bookedArtistIds } }).lean();

  const scores = [];

  for (const other of otherArtists) {
    let totalScore = 0;
    for (const booked of bookedArtists) {
      totalScore += computeArtistSimilarity(booked, other);
    }
    scores.push({ 
      artistId: other._id.toString(), 
      score: totalScore,
      reason: 'Matches your style',
      algorithm: 'for-you'
    });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, limit);
};

export const getArtistRecommendationsForClient = async (req, res) => {
  const clientId = req.params.clientId;

  try {
    const clientBookings = await Booking.find({ client: clientId }).select('artist').lean();
    const bookedArtistIds = [...new Set(clientBookings.map(b => b.artist.toString()))];

    let recommendations = [];
    let algorithmUsed = '';

    if (bookedArtistIds.length === 0) {
      console.log(`New user ${clientId} - using trending recommendations`);
      
      const collaborativeRecs = await getCollaborativeRecommendations(10);
      recommendations = collaborativeRecs;
      algorithmUsed = 'trending';
      
    } else {
      console.log(`Existing user ${clientId} with ${bookedArtistIds.length} bookings - using personalized + trending`);
      
      const contentRecs = await getContentBasedRecommendations(clientId, 7);
      const collaborativeRecs = await getCollaborativeRecommendations(5);
      const filteredCollaborativeRecs = collaborativeRecs.filter(
        rec => !bookedArtistIds.includes(rec.artistId)
      );
      recommendations = [
        ...contentRecs.map(rec => ({ ...rec, weight: 0.7, finalScore: rec.score * 0.7 })),
        ...filteredCollaborativeRecs.slice(0, 3).map(rec => ({ ...rec, weight: 0.3, finalScore: rec.score * 0.3 }))
      ];
      
      algorithmUsed = 'smart-picks';
    }

    const uniqueRecs = new Map();
    recommendations.forEach(rec => {
      const existing = uniqueRecs.get(rec.artistId);
      const currentScore = rec.finalScore || rec.score;
      if (!existing || existing.finalScore < currentScore) {
        uniqueRecs.set(rec.artistId, { ...rec, finalScore: currentScore });
      }
    });

    const finalRecs = Array.from(uniqueRecs.values())
      .sort((a, b) => (b.finalScore || b.score) - (a.finalScore || a.score))
      .slice(0, 10);
      
    const artistIds = finalRecs.map(rec => rec.artistId);
    const artists = await Artist.find({ _id: { $in: artistIds } }).lean();
    
    const recommendedArtists = finalRecs.map(rec => {
      const artist = artists.find(a => a._id.toString() === rec.artistId);
      return {
        ...artist,
        recommendationScore: rec.finalScore || rec.score,
        algorithm: rec.algorithm,
        reason: rec.reason,
        weight: rec.weight
      };
    });

    console.log("Recommendations:", recommendedArtists.map(a => ({
      username: a.username,
      score: a.recommendationScore,
      algorithm: a.algorithm,
      reason: a.reason
    })));

    return res.json({ 
      recommended: recommendedArtists,
      algorithm: algorithmUsed,
      userBookings: bookedArtistIds.length,
      isNewUser: bookedArtistIds.length === 0
    });
    
  } catch (error) {
    console.error('Error in getArtistRecommendationsForClient:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const testRecommendationAlgorithms = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Test collaborative recommendations
    const collaborativeRecs = await getCollaborativeRecommendations(5);
    console.log('Collaborative recommendations:', collaborativeRecs.length);
    
    // Test content-based if user has bookings
    const clientBookings = await Booking.find({ client: clientId }).select('artist').lean();
    let contentRecs = [];
    if (clientBookings.length > 0) {
      contentRecs = await getContentBasedRecommendations(clientId, 5);
      console.log('Content-based recommendations:', contentRecs.length);
    }
    
    return res.json({
      collaborative: collaborativeRecs,
      contentBased: contentRecs,
      userBookings: clientBookings.length,
      message: 'Test completed successfully'
    });
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ error: error.message });
  }
};
