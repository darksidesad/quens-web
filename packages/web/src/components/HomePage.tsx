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
import { PublicShell } from './PublicShell';
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
          className="min-h-screen flex items-center justify-center relative pt-20 overflow-hidden"
          style={content.home.hero.imagen ? { backgroundImage: `url(${imageUrl(content.home.hero.imagen)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="absolute inset-0 bg-bg/80" />
          {/* Halo plateado sutil detrás del contenido */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] max-w-[90vw] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--color-silver) 0%, transparent 65%)' }}
          />
          <div className="relative z-10 text-center px-6 max-w-3xl">
            <span className="silver-divider w-24 mx-auto mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }} />
            <p className="eyebrow mb-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {lang === 'es' ? 'Bienestar & Lujo' : 'Wellness & Luxury'}
            </p>
            <h1 className="text-5xl md:text-7xl mb-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <span className="gold-text">{tLocalized(content.home.hero.titulo, lang)}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              {tLocalized(content.home.hero.subtitulo, lang)}
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noopener"
              className="group relative inline-block overflow-hidden px-9 py-3.5 border border-silver/60 text-silver-light text-xs font-semibold tracking-widest uppercase rounded-sm transition-all duration-300 hover:border-silver hover:shadow-[0_0_24px_-4px_var(--color-silver)] animate-fade-up"
              style={{ animationDelay: '0.45s' }}
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-bg">{ui('book', lang)}</span>
              <span
                aria-hidden
                className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-t from-silver-dark via-silver to-silver-light transition-transform duration-300 ease-out group-hover:translate-y-0"
              />
            </a>
          </div>
          {/* Indicador de scroll plateado */}
          <div aria-hidden className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '0.7s' }}>
            <span className="w-px h-10 bg-gradient-to-b from-transparent via-silver to-transparent" />
            <span className="animate-float text-silver-dark text-xs">▼</span>
          </div>
        </section>

        <section className="relative max-w-6xl mx-auto px-6 py-20">
          <span className="glow-gold left-1/4 top-0 h-72 w-72 -translate-x-1/2" aria-hidden />
          <p className="eyebrow text-center block">{lang === 'es' ? 'Experiencias' : 'Experiences'}</p>
          <h2 className="text-3xl text-center text-gold">{ui('ourServices', lang)}</h2>
          <span className="silver-accent" />
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {servicios.map((s, i) => (
              <article
                key={s.id}
                className="group relative bg-surface border border-border p-6 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-silver/50 hover:shadow-[0_12px_40px_-12px_rgba(199,204,209,0.25)] animate-fade-up"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-silver to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {s.imagen && (
                  <div className="overflow-hidden rounded mb-4">
                    <img src={imageUrl(s.imagen)} alt="" className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <h3 className="text-xl text-gold mb-2">{tLocalized(s.nombre, lang)}</h3>
                <p className="text-muted text-sm mb-4">{tLocalized(s.descripcion, lang)}</p>
                <p className="text-gold-light font-semibold">{formatCop(s.precio, lang)}</p>
              </article>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/servicios" className="group inline-flex items-center gap-2 text-silver text-sm tracking-widest uppercase transition-colors hover:text-silver-light">
              {ui('allServices', lang)}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </section>

        <section className="relative max-w-6xl mx-auto px-6 py-20">
          <span className="glow-gold right-1/4 top-10 h-72 w-72 translate-x-1/2" aria-hidden />
          <p className="eyebrow text-center block">{lang === 'es' ? 'Nuestro equipo' : 'Our team'}</p>
          <h2 className="text-3xl text-center text-gold">{ui('meetTeam', lang)}</h2>
          <span className="silver-accent" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {chicas.map((c, i) => (
              <a
                key={c.id}
                href={`/chicas/${c.slug}`}
                className="group relative bg-surface border border-border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-silver/50 hover:shadow-[0_12px_40px_-12px_rgba(199,204,209,0.25)] animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="aspect-[3/4] bg-surface-light relative overflow-hidden">
                  {c.fotos[0] ? (
                    <img src={imageUrl(c.fotos[0])} alt={tLocalized(c.nombre, lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-4xl font-[family-name:var(--font-display)]">{tLocalized(c.nombre, lang)[0]}</div>
                  )}
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg text-gold transition-colors group-hover:text-gold-light">{tLocalized(c.nombre, lang)}</h3>
                  <p className="text-muted text-sm line-clamp-2 mt-1">{tLocalized(c.descripcion, lang)}</p>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/chicas" className="group inline-flex items-center gap-2 text-silver text-sm tracking-widest uppercase transition-colors hover:text-silver-light">
              {ui('navTeam', lang)}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </section>

        <section className="relative max-w-6xl mx-auto px-6 py-20">
          <p className="eyebrow text-center block">{lang === 'es' ? 'Visítanos' : 'Visit us'}</p>
          <h2 className="text-3xl text-center text-gold">{ui('location', lang)}</h2>
          <span className="silver-accent" />
          <p className="text-center text-muted mt-6 mb-8">{tLocalized(content.contacto.direccion, lang)}</p>
          <div className="rounded-lg overflow-hidden border border-border transition-colors duration-300 hover:border-silver/40">
            <Map lat={content.contacto.mapa.lat} lng={content.contacto.mapa.lng} className="w-full h-72" />
          </div>
        </section>
      </main>
      <Footer contacto={content.contacto} />
    </>
  );
}

export default function HomePage() {
  return (
    <PublicShell>
      <HomeContent />
    </PublicShell>
  );
}
