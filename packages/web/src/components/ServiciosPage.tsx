import { useEffect, useState } from 'react';
import type { Content } from '@quenns/shared';
import { getSortedServicios, tLocalized, ui, formatCop } from '@quenns/shared';
import { fetchContent, imageUrl } from '../lib/api';
import { PublicShell } from './PublicShell';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLang } from '../lib/lang';

function ServiciosContent() {
  const { lang } = useLang();
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    fetchContent().then(setContent);
  }, []);

  if (!content) return <p className="text-center py-32 text-muted">Cargando...</p>;

  const servicios = getSortedServicios(content);

  return (
    <>
      <Header />
      <main className="pt-28 pb-20 max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl text-gold text-center mb-16">{ui('allServices', lang)}</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {servicios.map((s) => (
            <article key={s.id} className="flex gap-6 bg-surface border border-border rounded-lg p-6">
              {s.imagen ? (
                <img src={imageUrl(s.imagen)} alt="" className="w-32 h-32 object-cover rounded shrink-0" />
              ) : (
                <div className="w-32 h-32 bg-surface-light rounded shrink-0 flex items-center justify-center text-gold text-2xl">✦</div>
              )}
              <div>
                <h2 className="text-2xl text-gold mb-2">{tLocalized(s.nombre, lang)}</h2>
                <p className="text-muted text-sm mb-4">{tLocalized(s.descripcion, lang)}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gold-light font-semibold">{formatCop(s.precio, lang)}</span>
                  <span className="text-muted">{s.duracion}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer contacto={content.contacto} />
    </>
  );
}

export default function ServiciosPage() {
  return (
    <PublicShell>
      <ServiciosContent />
    </PublicShell>
  );
}
