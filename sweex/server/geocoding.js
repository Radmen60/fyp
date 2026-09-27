// geocoding.js — turns a typed address into map coordinates (and back again).
// Uses OpenStreetMap's free Nominatim API, same as the original Python version.
// Needs a descriptive User-Agent and reasonable request volume — see
// https://operations.osmfoundation.org/policies/nominatim/ before scaling this up.

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'SweetWasteExchange-StudentProject/1.0';
const TIMEOUT_MS = 6000;

export class GeocodingError extends Error {}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Turn a typed address into { lat, lng, displayName }.
export async function geocodeAddress(address) {
  address = (address || '').trim();
  if (!address) throw new GeocodingError('Please enter an address.');

  const url = `${NOMINATIM_SEARCH_URL}?${new URLSearchParams({ q: address, format: 'json', limit: '1' })}`;
  let results;
  try {
    const res = await fetchWithTimeout(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error('bad status');
    results = await res.json();
  } catch {
    throw new GeocodingError("Couldn't reach the location lookup service. Check your internet connection and try again.");
  }

  if (!Array.isArray(results) || results.length === 0) {
    throw new GeocodingError(`Couldn't find a location for "${address}". Try adding more detail, like a city or country.`);
  }

  const top = results[0];
  const lat = parseFloat(top.lat);
  const lng = parseFloat(top.lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new GeocodingError('The location lookup service returned an unexpected response. Please try again.');
  }
  return { lat, lng, displayName: top.display_name || address };
}

// Turn coordinates into a human-readable address string.
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM_REVERSE_URL}?${new URLSearchParams({ lat: String(lat), lon: String(lng), format: 'json' })}`;
  let result;
  try {
    const res = await fetchWithTimeout(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error('bad status');
    result = await res.json();
  } catch {
    throw new GeocodingError("Couldn't reach the location lookup service.");
  }

  const displayName = result && result.display_name;
  if (!displayName) throw new GeocodingError("Couldn't determine an address for that location.");
  return displayName;
}
