import { useEffect, useRef } from 'react';

interface MapProps {
  lat: number;
  lng: number;
  className?: string;
}

export function Map({ lat, lng, className = '' }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let map: import('leaflet').Map | null = null;

    void (async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (!ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      L.marker([lat, lng]).addTo(map);
    })();

    return () => {
      map?.remove();
    };
  }, [lat, lng]);

  return <div ref={ref} className={`rounded-lg border border-border ${className}`} style={{ minHeight: 280 }} />;
}
