import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons, which Leaflet resolves via relative URLs that
// don't survive bundling — point them at the CDN copy instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function LocationMap({ lat, lng, label, zoom = 13 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || lat == null || lng == null) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([lat, lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng], zoom);
    }

    const marker = L.marker([lat, lng]).addTo(mapRef.current);
    if (label) marker.bindPopup(label);

    return () => {
      marker.remove();
    };
  }, [lat, lng, zoom, label]);

  useEffect(() => () => { mapRef.current?.remove(); mapRef.current = null; }, []);

  if (lat == null || lng == null) return null;
  return <div id="map" ref={containerRef} />;
}
