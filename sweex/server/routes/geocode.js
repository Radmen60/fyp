import { Router } from 'express';
import { reverseGeocode, GeocodingError } from '../geocoding.js';

const router = Router();

router.get('/reverse-geocode', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'Invalid coordinates.' });
  }
  try {
    const address = await reverseGeocode(lat, lng);
    res.json({ address, lat, lng });
  } catch (e) {
    if (e instanceof GeocodingError) return res.status(502).json({ error: e.message });
    throw e;
  }
});

export default router;
