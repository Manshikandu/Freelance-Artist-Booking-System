// export const computeSimilarityScore = (artist, job) => {
//   let score = 0;

//   if (artist.category === job.category) score += 0.5;

//   if (artist.genres && job.genres) {
//     const overlap = artist.genres.filter(g => job.genres.includes(g)).length;
//     score += 0.1 * overlap;
//   }

//   if (artist.location === job.location) score += 0.2;

//   return score;
// };


//mine
// export const computeSimilarityScore = (artist, job) => {
//   let score = 0;

//   if (!artist || !job) return 0;

//   if (artist.category && job.category && artist.category === job.category) score += 0.5;

//   if (artist.genres && job.genres) {
//     const overlap = artist.genres.filter(g => job.genres.includes(g)).length;
//     score += 0.1 * overlap;
//   }

//   if (artist.location?.city && job.location?.city && artist.location.city === job.location.city) {
//     score += 0.2;
//   }

//   return score;
// };


// export const jaccardSimilarity = (a, b) => {
//   const setA = new Set(a);
//   const setB = new Set(b);
//   const intersection = new Set([...setA].filter(x => setB.has(x)));
//   const union = new Set([...setA, ...setB]);
//   return intersection.size / union.size;
// };



//updated
export const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

export const cosineSimilarity = (tokensA, tokensB) => {
  const freqA = {};
  const freqB = {};

  tokensA.forEach(t => freqA[t] = (freqA[t] || 0) + 1);
  tokensB.forEach(t => freqB[t] = (freqB[t] || 0) + 1);

  const allTokens = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  allTokens.forEach(token => {
    const a = freqA[token] || 0;
    const b = freqB[token] || 0;
    dotProduct += a * b;
    magA += a ** 2;
    magB += b ** 2;
  });

  return magA && magB ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
};
