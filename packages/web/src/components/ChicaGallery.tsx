import { useState } from 'react';
import { imageUrl } from '../lib/api';

interface Props {
  fotos: string[];
  nombre: string;
}

export function ChicaGallery({ fotos, nombre }: Props) {
  const [active, setActive] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-surface/90 border border-border rounded-lg flex items-center justify-center text-6xl text-gold font-[family-name:var(--font-display)] backdrop-blur-sm">
        {nombre[0]}
      </div>
    );
  }

  const safeIndex = Math.min(active, fotos.length - 1);
  const main = fotos[safeIndex];

  return (
    <div className="space-y-3">
      <img
        src={imageUrl(main)}
        alt={nombre}
        className="w-full aspect-[4/5] object-cover rounded-lg border border-border bg-surface/80"
      />
      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotos.map((f, i) => (
            <button
              key={`${f}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded border overflow-hidden transition-all ${
                i === safeIndex ? 'border-gold ring-2 ring-gold/40' : 'border-border opacity-70 hover:opacity-100'
              }`}
            >
              <img src={imageUrl(f)} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {fotos.length > 1 && (
        <p className="text-xs text-muted text-center">
          {safeIndex + 1} / {fotos.length}
        </p>
      )}
    </div>
  );
}
