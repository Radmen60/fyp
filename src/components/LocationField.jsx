import { useState } from 'react';
import { api } from '../api.js';
import { LocationPinIcon } from '../icons.jsx';

// Ported from the Flask app's _location_field.html: a text address field,
// plus a button that uses the browser's Geolocation API and reverse-geocodes
// via the backend to fill the address automatically.
export default function LocationField({ address, onAddressChange, onCoordsResolved, label = 'Address' }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const { address: resolvedAddress } = await api.reverseGeocode(latitude, longitude);
          onAddressChange(resolvedAddress);
          onCoordsResolved(latitude, longitude);
        } catch (e) {
          setError(e.message || 'Could not resolve your address.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError('Could not get your location. Check your browser permissions.');
        setLocating(false);
      }
    );
  }

  return (
    <div className="location-field">
      <label>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><LocationPinIcon size={14} />{label}</span>
        <input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="e.g. 12 Fort Street, Bulawayo"
        />
      </label>
      <button type="button" className="btn btn--small location-field__btn" onClick={useCurrentLocation} disabled={locating}>
        <LocationPinIcon size={14} /> {locating ? 'Locating…' : 'Use my current location'}
      </button>
      {error && <p className="form-note form-note--error">{error}</p>}
    </div>
  );
}
