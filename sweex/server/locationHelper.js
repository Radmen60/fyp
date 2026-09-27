import { geocodeAddress, GeocodingError } from './geocoding.js';

// Turn request body fields into { address, lat, lng }.
// If the client already supplied lat/lng (from "Use my current location",
// which reverse-geocodes client-side), trust those directly. Otherwise,
// forward-geocode the typed address. Throws GeocodingError on failure.
export async function resolveLocation(body) {
  const address = (body.address || '').trim();
  const hasCoords = body.lat !== undefined && body.lat !== null && body.lat !== '' &&
                     body.lng !== undefined && body.lng !== null && body.lng !== '';

  if (hasCoords) {
    const lat = parseFloat(body.lat);
    const lng = parseFloat(body.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { address, lat, lng };
    }
  }

  if (!address) {
    throw new GeocodingError('Please enter an address, or use "Use my current location".');
  }

  const result = await geocodeAddress(address);
  return { address, lat: result.lat, lng: result.lng };
}
