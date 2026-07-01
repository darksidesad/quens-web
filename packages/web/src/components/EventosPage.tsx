import { useEffect, useMemo, useState } from 'react';
import type { Content, Evento } from '@quenns/shared';
import { getActiveEventos, tLocalized, ui, formatEventDate } from '@quenns/shared';
import { fetchContent, imageUrl } from '../lib/api';
import { PublicShell } from './PublicShell';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLang } from '../lib/lang';

function EventoCard({ evento, langLabel }: { evento: Evento; langLabel: 'all' | 'past' }) {
  const { lang } = useLang();
  const isPast = langLabel === 'past';
  return (
    <article
      className={`group relative bg-surface border border-border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-silver/40 hover:shadow-[0_12px_40px_-12px_rgba(199,204,209,0.25)] ${isPast ? 'opacity-70' : ''}`}
    >
      <div className="aspect-[16/10] bg-surface-light overflow-hidden relative">
        {evento.imagen ? (
          <img
            src={imageUrl(evento.imagen)}
            alt={tLocalized(evento.titulo, lang)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold text-5xl font-[family-name:var(--font-display)]">
            ✦
          </div>
        )}
        {evento.destacado && !isPast && (
          <span className="absolute top-3 left-3 bg-gold text-bg text-[10px] tracking-widest uppercase px-2 py-1 rounded">
            {lang === 'es' ? 'Destacado' : 'Featured'}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs tracking-widest uppercase text-gold-light">
          {formatEventDate(evento.fecha, lang)}
          {evento.hora ? ` · ${evento.hora}` : ''}
        </p>
        <h2 className="text-2xl text-gold mt-1">{tLocalized(evento.titulo, lang)}</h2>
        {evento.lugar && (
          <p className="text-xs text-muted mt-1">
            {ui('eventLocation', lang)}: {evento.lugar}
          </p>
        )}
        <p className="text-muted text-sm mt-3 whitespace-pre-line">
          {tLocalized(evento.descripcion, lang)}
        </p>
        {evento.enlace && !isPast && (
          <a
            href={evento.enlace}
            target="_blank"
            rel="noopener"
            className="inline-block mt-4 text-silver text-xs tracking-widest uppercase hover:text-silver-light transition-colors"
          >
            {ui('eventMoreInfo', lang)} →
          </a>
        )}
      </div>
    </article>
  );
}

function EventosContent() {
  const { lang } = useLang();
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    fetchContent().then(setContent);
  }, []);

  const { upcoming, past } = useMemo(() => {
    if (!content) return { upcoming: [], past: [] };
    const all = getActiveEventos(content);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return {
      upcoming: all.filter((e) => e.fecha >= today),
      past: all.filter((e) => e.fecha < today).reverse(),
    };
  }, [content]);

  if (!content) return <p className="text-center py-32 text-muted">Cargando...</p>;

  return (
    <>
      <Header />
      <main className="pt-28 pb-20 max-w-6xl mx-auto px-6">
        <p className="eyebrow text-center block">{lang === 'es' ? 'Calendario' : 'Calendar'}</p>
        <h1 className="text-4xl md:text-5xl text-gold text-center mb-4">{ui('upcomingEvents', lang)}</h1>
        <span className="silver-accent" />

        {upcoming.length === 0 ? (
          <p className="text-center text-muted mt-16">{ui('noEvents', lang)}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {upcoming.map((e) => (
              <EventoCard key={e.id} evento={e} langLabel="all" />
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-2xl text-gold mt-20 mb-6 text-center">{ui('pastEvents', lang)}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((e) => (
                <EventoCard key={e.id} evento={e} langLabel="past" />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer contacto={content.contacto} />
    </>
  );
}

export default function EventosPage() {
  return (
    <PublicShell>
      <EventosContent />
    </PublicShell>
  );
}
