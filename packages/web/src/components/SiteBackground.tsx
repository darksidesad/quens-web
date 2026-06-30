import { useEffect, useState, type ReactNode } from 'react';
import { fetchContent, imageUrl } from '../lib/api';

interface Props {
  children: ReactNode;
}

export function SiteBackground({ children }: Props) {
  const [fondo, setFondo] = useState('');

  useEffect(() => {
    fetchContent()
      .then((c) => setFondo(c.apariencia?.fondo || ''))
      .catch(() => setFondo(''));
  }, []);

  return (
    <div className="relative min-h-screen">
      {fondo && (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imageUrl(fondo)})` }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-bg/95 via-bg/88 to-bg/97"
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
