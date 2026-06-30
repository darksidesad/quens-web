import { useEffect, useState } from 'react';
import type { Content } from '@quenns/shared';
import { getActiveChicas, tLocalized, ui } from '@quenns/shared';
import { fetchContent, imageUrl } from '../lib/api';
import { PublicShell } from './PublicShell';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLang } from '../lib/lang';

function ChicasContent() {
  const { lang } = useLang();
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    fetchContent().then(setContent);
  }, []);

  if (!content) return <p className="text-center py-32 text-muted">Cargando...</p>;

  const chicas = getActiveChicas(content);

  return (
    <>
      <Header />
      <main className="pt-28 pb-20 max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl text-gold text-center mb-4">{ui('ourTeam', lang)}</h1>
        <p className="text-center text-muted mb-16 max-w-xl mx-auto">
          {lang === 'es' ? 'Conoce a nuestras profesionales' : 'Meet our professionals'}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {chicas.map((c) => (
            <a key={c.id} href={`/chicas/${c.slug}`} className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-gold/50 transition-all">
              <div className="aspect-[3/4] bg-surface-light overflow-hidden">
                {c.fotos[0] ? (
                  <img src={imageUrl(c.fotos[0])} alt={tLocalized(c.nombre, lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-5xl font-[family-name:var(--font-display)]">
                    {tLocalized(c.nombre, lang)[0]}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-xl text-gold">{tLocalized(c.nombre, lang)}</h2>
                <p className="text-muted text-sm mt-2 line-clamp-3">{tLocalized(c.descripcion, lang)}</p>
                <span className="inline-block mt-4 text-xs tracking-widest uppercase text-gold">{ui('viewProfile', lang)} →</span>
              </div>
            </a>
          ))}
        </div>
      </main>
      <Footer contacto={content.contacto} />
    </>
  );
}

export default function ChicasPage() {
  return (
    <PublicShell>
      <ChicasContent />
    </PublicShell>
  );
}
