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
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);
      const icon = L.divIcon({
        className: '',
        html: '<span style="font-size: 2rem; line-height: 1;">💋</span>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([lat, lng], { icon }).addTo(map);
    })();

    return () => {
      map?.remove();
    };
  }, [lat, lng]);

  return <div ref={ref} className={`rounded-lg border border-border ${className}`} style={{ minHeight: 280 }} />;
}
