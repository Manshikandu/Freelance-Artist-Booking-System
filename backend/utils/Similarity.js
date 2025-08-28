
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
