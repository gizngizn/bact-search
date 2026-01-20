import { getBacteria, getClinicalRelevancy } from './data';

/**
 * Search bacteria by query
 * Searches fullname, genus, and species fields
 * Returns results sorted by relevancy (prevalence) and match quality
 */
export function searchBacteria(query, limit = 50) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const bacteria = getBacteria();
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  // Score and filter bacteria
  const scoredResults = bacteria
    .map(b => {
      const score = calculateScore(b, normalizedQuery, queryWords);
      return { bacteria: b, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => {
      // Sort by score (descending), then by prevalence (lower is more common)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.bacteria.prevalence - b.bacteria.prevalence;
    })
    .slice(0, limit);

  // Return bacteria with relevancy info
  return scoredResults.map(r => ({
    mo: r.bacteria.mo,
    fullname: r.bacteria.fullname,
    rank: r.bacteria.rank,
    genus: r.bacteria.genus,
    family: r.bacteria.family,
    prevalence: r.bacteria.prevalence,
    relevancy: getClinicalRelevancy(r.bacteria.prevalence)
  }));
}

/**
 * Calculate search relevancy score for a bacterium
 */
function calculateScore(bacteria, normalizedQuery, queryWords) {
  const fullname = (bacteria.fullname || '').toLowerCase();
  const genus = (bacteria.genus || '').toLowerCase();
  const species = (bacteria.species || '').toLowerCase();

  let score = 0;

  // Exact fullname match - highest score
  if (fullname === normalizedQuery) {
    score += 100;
  }
  // Fullname starts with query
  else if (fullname.startsWith(normalizedQuery)) {
    score += 80;
  }
  // Genus matches query exactly
  else if (genus === normalizedQuery) {
    score += 70;
  }
  // Species matches query exactly
  else if (species === normalizedQuery) {
    score += 60;
  }
  // Fullname contains query
  else if (fullname.includes(normalizedQuery)) {
    score += 50;
  }
  // All query words found in fullname
  else if (queryWords.every(word => fullname.includes(word))) {
    score += 40;
  }
  // Genus starts with query
  else if (genus.startsWith(normalizedQuery)) {
    score += 35;
  }
  // Species starts with query
  else if (species.startsWith(normalizedQuery)) {
    score += 30;
  }
  // Genus or species contains any query word
  else if (queryWords.some(word => genus.includes(word) || species.includes(word))) {
    score += 20;
  }

  // Boost for clinically relevant bacteria (lower prevalence = more common/important)
  if (score > 0 && bacteria.prevalence <= 1.25) {
    score += 10;
  }

  return score;
}
