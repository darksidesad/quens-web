import { useEffect, useState } from 'react';
import type { Content } from '@quenns/shared';
import {
  getActiveChicas,
  getSortedServicios,
  tLocalized,
  ui,
  whatsappUrl,
  formatCop,
} from '@quenns/shared';
import { fetchContent, imageUrl } from '../lib/api';
import { LangProvider } from '../lib/lang';
import { Header } from './Header';
import { Footer } from './Footer';
import { Map } from './Map';
import { useLang } from '../lib/lang';

function HomeContent() {
  const { lang } = useLang();
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent().then(setContent).catch(() => setError('Error loading content'));
  }, []);

  if (error) return <p className="text-center py-32 text-red-400">{error}</p>;
  if (!content) return <p className="text-center py-32 text-muted">Cargando...</p>;

  const chicas = getActiveChicas(content).slice(0, 4);
  const servicios = getSortedServicios(content).slice(0, 3);
  const wa = whatsappUrl(content.contacto.whatsapp, 'Hola, me gustaría información sobre Quenns Spa');

  return (
    <>
      <Header />
      <main>
        <section
          className="min-h-screen flex items-center justify-center relative pt-20"
          style={content.home.hero.imagen ? { backgroundImage: `url(${imageUrl(content.home.hero.imagen)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="absolute inset-0 bg-bg/80" />
          <div className="relative z-10 text-center px-6 max-w-3xl">
            <h1 className="text-5xl md:text-7xl text-gold mb-6">{tLocalized(content.home.hero.titulo, lang)}</h1>
            <p className="text-lg md:text-xl text-muted mb-10">{tLocalized(content.home.hero.subtitulo, lang)}</p>
            <a href={wa} target="_blank" rel="noopener" className="inline-block px-8 py-3 border border-gold text-gold text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-bg transition-colors">
              {ui('book', lang)}
            </a>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl text-center text-gold mb-12">{ui('ourServices', lang)}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {servicios.map((s) => (
              <article key={s.id} className="bg-surface border border-border p-6 rounded-lg">
                {s.imagen && <img src={imageUrl(s.imagen)} alt="" className="w-full h-40 object-cover rounded mb-4" />}
                <h3 className="text-xl text-gold mb-2">{tLocalized(s.nombre, lang)}</h3>
                <p className="text-muted text-sm mb-4">{tLocalized(s.descripcion, lang)}</p>
                <p className="text-gold-light font-semibold">{formatCop(s.precio, lang)}</p>
              </article>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/servicios" className="text-gold text-sm tracking-widest uppercase hover:underline">{ui('allServices', lang)} →</a>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl text-center text-gold mb-12">{ui('meetTeam', lang)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chicas.map((c) => (
              <a key={c.id} href={`/chicas/${c.slug}`} className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-gold/50 transition-colors">
                <div className="aspect-[3/4] bg-surface-light">
                  {c.fotos[0] ? (
                    <img src={imageUrl(c.fotos[0])} alt={tLocalized(c.nombre, lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-4xl font-[family-name:var(--font-display)]">{tLocalized(c.nombre, lang)[0]}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg text-gold">{tLocalized(c.nombre, lang)}</h3>
                  <p className="text-muted text-sm line-clamp-2 mt-1">{tLocalized(c.descripcion, lang)}</p>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/chicas" className="text-gold text-sm tracking-widest uppercase hover:underline">{ui('navTeam', lang)} →</a>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl text-center text-gold mb-4">{ui('location', lang)}</h2>
          <p className="text-center text-muted mb-8">{tLocalized(content.contacto.direccion, lang)}</p>
          <Map lat={content.contacto.mapa.lat} lng={content.contacto.mapa.lng} className="w-full h-72" />
        </section>
      </main>
      <Footer contacto={content.contacto} />
    </>
  );
}

export default function HomePage() {
  return (
    <LangProvider>
      <HomeContent />
    </LangProvider>
  );
}
