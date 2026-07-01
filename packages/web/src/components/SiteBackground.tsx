import { useEffect, useState, type ReactNode } from 'react';
import { fetchContent, imageUrl } from '../lib/api';
import type { Apariencia } from '@quenns/shared';

interface Props {
  children: ReactNode;
}

const DEFAULT_APARIENCIA: Apariencia = {
  fondo: '',
  fondoMovil: { size: 'cover', position: 'center', repeat: false, opacity: 0.35 },
};

function toBackgroundCss(
  url: string,
  size: Apariencia['fondoMovil']['size'],
  position: Apariencia['fondoMovil']['position'],
  repeat: boolean,
) {
  const bgPos = position.replace(/-/g, ' ');
  return {
    backgroundImage: `url(${imageUrl(url)})`,
    backgroundSize: size,
    backgroundPosition: bgPos,
    backgroundRepeat: repeat ? 'repeat' : 'no-repeat',
  };
}

export function SiteBackground({ children }: Props) {
  const [apariencia, setApariencia] = useState<Apariencia>(DEFAULT_APARIENCIA);

  useEffect(() => {
    fetchContent()
      .then((c) => setApariencia(c.apariencia ?? DEFAULT_APARIENCIA))
      .catch(() => setApariencia(DEFAULT_APARIENCIA));
  }, []);

  const { fondo, fondoMovil } = apariencia;
  const overlayOpacity = Math.max(0, Math.min(1, 1 - fondoMovil.opacity));

  const mobileCss = fondo
    ? toBackgroundCss(fondo, fondoMovil.size, fondoMovil.position, fondoMovil.repeat)
    : undefined;

  return (
    <div className="relative min-h-screen">
      {fondo && (
        <>
          <div
            aria-hidden
            className="site-bg-layer site-bg-image pointer-events-none z-0 bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imageUrl(fondo)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          {/* En móvil sobrescribimos con los valores configurados en el admin */}
          <div
            aria-hidden
            className="site-bg-layer-mobile site-bg-image pointer-events-none z-0"
            style={mobileCss}
          />
          <div
            aria-hidden
            className="site-bg-layer pointer-events-none z-0 bg-gradient-to-b from-bg/95 via-bg/88 to-bg/97"
            style={{ opacity: overlayOpacity }}
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
