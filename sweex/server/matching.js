// matching.js — value estimation and matching (recommendation) logic.
// Direct port of the Python matching.py: keep the numbers identical so
// behaviour doesn't drift between the two versions of this project.

// Rough base price per unit, by category (placeholder figures - tune to your market)
export const BASE_PRICE_PER_UNIT = {
  plastic: 0.5,       // per kg
  metal: 2.0,         // per kg
  wood: 0.3,          // per kg or per unit (pallets etc.)
  electronics: 5.0,   // per unit
  textile: 1.0,       // per kg
  furniture: 15.0,    // per unit
  paper: 0.2,         // per kg
  organic: 0.1,       // per kg
  other: 0.5,
};

export const CONDITION_MULTIPLIER = {
  new: 1.0,
  good: 0.8,
  fair: 0.5,
  poor: 0.2,
};

// How far away (km) a match is still considered "close" for scoring purposes.
export const MAX_RELEVANT_DISTANCE_KM = 50;
export const CATEGORY_WEIGHT = 0.6;
export const DISTANCE_WEIGHT = 0.4;

export function estimateValue(category, quantity, condition) {
  const base = BASE_PRICE_PER_UNIT[category] ?? BASE_PRICE_PER_UNIT.other;
  const multiplier = CONDITION_MULTIPLIER[condition] ?? 0.5;
  const value = base * Number(quantity) * multiplier;
  return Math.round(value * 100) / 100;
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const r = 6371.0;
  const toRad = (d) => (d * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lng2 - lng1);
  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

export function scoreCandidate(material, user) {
  const preferred = (user.preferred_categories || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const categoryScore = preferred.includes(material.category) ? 1.0 : 0.3;

  const distanceKm = haversineKm(material.latitude, material.longitude, user.latitude, user.longitude);
  const distanceScore = Math.max(0, 1 - distanceKm / MAX_RELEVANT_DISTANCE_KM);

  const total = CATEGORY_WEIGHT * categoryScore + DISTANCE_WEIGHT * distanceScore;
  return { score: Math.round(total * 1000) / 1000, distanceKm: Math.round(distanceKm * 10) / 10 };
}

// Given a material row and a list of candidate user rows (recyclers, waste
// collectors, businesses, organisations — not the owner), return the topN
// scored, sorted best-first.
export function findMatches(material, candidateUsers, topN = 5) {
  const scored = [];
  for (const user of candidateUsers) {
    if (user.id === material.owner_id) continue;
    const { score, distanceKm } = scoreCandidate(material, user);
    scored.push({ user, score, distanceKm });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}
