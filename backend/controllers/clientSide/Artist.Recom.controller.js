import Booking from '../../models/Artist.Booking.model.js';
import Artist from '../../models/Artist.model.js';
import Review from '../../models/Review.model.js';

  const computeArtistSimilarity = (a, b) => {
    let score = 0;
    let breakdown = [];

    if (a.category && b.category && a.category === b.category) {
      score += 0.5;
      breakdown.push(`Category match (${a.category}): +0.5`);
    } else {
      breakdown.push(`Category mismatch (${a.category} vs ${b.category}): +0`);
    }

    if (a.genres && b.genres) {
      const overlap = a.genres.filter(g => b.genres.includes(g)).length;
      const genreScore = 0.1 * overlap;
      score += genreScore;
      breakdown.push(`Genre overlap (${overlap} common): +${genreScore.toFixed(2)}`);
    } else {
      breakdown.push(`No genre data: +0`);
    }

    if (a.location?.city && b.location?.city && a.location.city === b.location.city) {
      score += 0.4;
      breakdown.push(`Same city (${a.location.city}): +0.4`);
    } else {
      breakdown.push(`Different cities (${a.location?.city || 'unknown'} vs ${b.location?.city || 'unknown'}): +0`);
    }

    if (a.weightedRating != null && b.weightedRating != null) {
      const avgRating = (a.weightedRating + b.weightedRating) / 2;
      const normalized = avgRating / 5;
      const ratingScore = 0.3 * normalized;
      score += ratingScore;
      breakdown.push(`Rating bonus (avg: ${avgRating.toFixed(2)}/5): +${ratingScore.toFixed(3)}`);
    } else {
      breakdown.push(`No rating data: +0`);
    }

    console.log(`${a.username || a._id} vs ${b.username || b._id}: ${score.toFixed(3)}`);

    return score;
  };

  const getCollaborativeRecommendations = async (limit = 10) => {
    try {
      console.log('\n=== COLLABORATIVE FILTERING ALGORITHM ===');
      console.log('Finding artists based on popularity and booking patterns...\n');

      const allBookingStats = await Booking.aggregate([
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
            username: '$artist.username'
          }
        }
      ]);

      if (allBookingStats.length === 0) {
        return [];
      }

      const maxBookings = Math.max(...allBookingStats.map(item => item.bookingCount));
      const maxCompleted = Math.max(...allBookingStats.map(item => item.completedCount));
      const maxTotalRatings = Math.max(...allBookingStats.map(item => item.totalRatings || 1));

      console.log(`Normalization basis:`);
      console.log(`  Max bookings in dataset: ${maxBookings}`);
      console.log(`  Max completed in dataset: ${maxCompleted}`);
      console.log(`  Max total ratings in dataset: ${maxTotalRatings}\n`);

      const scoredArtists = allBookingStats.map(item => {
        const bookingScore = (item.bookingCount / maxBookings) * 0.4;
        const completionScore = (item.completedCount / maxCompleted) * 0.3;
        const ratingScore = ((item.weightedRating || 0) / 5) * (item.totalRatings / maxTotalRatings) * 0.3;

        const finalScore = bookingScore + completionScore + ratingScore;

        return {
          artistId: item.artistId.toString(),
          username: item.username,
          score: finalScore,
          reason: 'Popular among other users',
          algorithm: 'trending'
        };
      });

      scoredArtists.sort((a, b) => b.score - a.score);
      const topArtists = scoredArtists.slice(0, limit);

      topArtists.forEach((item, index) => {
        console.log(`${index + 1}. ${item.username}: ${item.score.toFixed(3)}`);
      });

      return topArtists;
    } catch (error) {
      console.error('Error in collaborative recommendations:', error);
      return [];
    }
  };

  const getContentBasedRecommendations = async (clientId, limit = 10) => {
    console.log('\n=== CONTENT-BASED FILTERING ALGORITHM ===');
    console.log(`Finding artists similar to client ${clientId}'s booking history...\n`);

    const clientBookings = await Booking.find({ client: clientId }).select('artist').lean();
    const bookedArtistIds = [...new Set(clientBookings.map(b => b.artist.toString()))];

    if (bookedArtistIds.length === 0) {
      console.log('No booking history found for content-based recommendations');
      return [];
    }

    console.log(`Client has booked ${bookedArtistIds.length} unique artists`);

    const bookedArtists = await Artist.find({ _id: { $in: bookedArtistIds } }).lean();
    const otherArtists = await Artist.find({ _id: { $nin: bookedArtistIds } }).lean();

    console.log(`Comparing ${otherArtists.length} potential artists against ${bookedArtists.length} booked artists\n`);

    const scores = [];

    for (const other of otherArtists) {
      let totalScore = 0;
      
      for (const booked of bookedArtists) {
        const similarity = computeArtistSimilarity(booked, other);
        totalScore += similarity;
      }
      
      console.log(`${other.username}: ${totalScore.toFixed(3)}`);
      
      scores.push({ 
        artistId: other._id.toString(),
        username: other.username,
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
          rec=> !bookedArtistIds.includes(rec.artistId)
        );
        
        console.log('\n=== HYBRID ALGORITHM COMBINATION ===');
        console.log('Combining content-based (70%) with collaborative (30%) recommendations\n');
        
        recommendations = [
          ...contentRecs.map(rec => {
            const weightedScore = rec.score * 0.7;
            console.log(`Content-based: ${rec.username || rec.artistId} - Original: ${rec.score.toFixed(3)} × 0.7 = ${weightedScore.toFixed(3)}`);
            return { ...rec, weight: 0.7, finalScore: weightedScore };
          }),
          ...filteredCollaborativeRecs.slice(0, 3).map(rec => {
            const weightedScore = rec.score * 0.3;
            console.log(`Collaborative: ${rec.username || rec.artistId} - Original: ${rec.score.toFixed(3)} × 0.3 = ${weightedScore.toFixed(3)}`);
            return { ...rec, weight: 0.3, finalScore: weightedScore };
          })
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

      console.log('\n=== FINAL RECOMMENDATIONS ===');
      console.log("Final ranked recommendations:");
      recommendedArtists.forEach((artist, index) => {
        console.log(`${index + 1}. ${artist.username}:`);
        console.log(`   Final Score: ${artist.recommendationScore.toFixed(3)}`);
        console.log(`   Algorithm: ${artist.algorithm}`);
        console.log(`   Reason: ${artist.reason}`);
        if (artist.weight) {
          console.log(`   Weight Applied: ${artist.weight}`);
        }
      });

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
      
      const collaborativeRecs = await getCollaborativeRecommendations(5);
      console.log('Collaborative recommendations:', collaborativeRecs.length);

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