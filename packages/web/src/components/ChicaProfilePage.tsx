import { useEffect, useState } from 'react';
import type { Content, Servicio } from '@quenns/shared';
import {
  getChicaBySlug,
  tLocalized,
  ui,
  DIA_LABELS,
  formatCop,
  whatsappUrl,
  chicaWhatsappMessage,
} from '@quenns/shared';
import { fetchContent } from '../lib/api';
import { PublicShell } from './PublicShell';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChicaGallery } from './ChicaGallery';
import { useLang } from '../lib/lang';

interface Props {
  slug: string;
}

function resolveSlug(propSlug: string): string {
  if (propSlug) return propSlug;
  if (typeof window !== 'undefined') {
    return (window as unknown as { __QUENNS_SLUG__?: string }).__QUENNS_SLUG__
      || window.location.pathname.split('/').filter(Boolean).pop()
      || '';
  }
  return '';
}

function ChicaProfileContent({ slug: propSlug }: Props) {
  const [slug, setSlug] = useState(propSlug);

  useEffect(() => {
    if (!propSlug) setSlug(resolveSlug(''));
  }, [propSlug]);

  const { lang } = useLang();
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    fetchContent().then(setContent);
  }, [slug]);

  if (!slug) return <p className="text-center py-32 text-muted">Cargando...</p>;
  if (!content) return <p className="text-center py-32 text-muted">Cargando...</p>;

  const chica = getChicaBySlug(content, slug);
  if (!chica) {
    return (
      <div className="text-center py-32">
        <p className="text-gold text-2xl mb-4">{ui('notFound', lang)}</p>
        <a href="/chicas" className="text-muted hover:text-gold">{ui('backHome', lang)}</a>
      </div>
    );
  }

  const nombre = tLocalized(chica.nombre, lang);
  const servicios: Servicio[] = content.servicios.filter((s) => chica.servicios.includes(s.id));
  const wa = whatsappUrl(content.contacto.whatsapp, chicaWhatsappMessage(nombre));

  return (
    <>
      <Header />
      <main className="pt-28 pb-20 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <ChicaGallery fotos={chica.fotos} nombre={nombre} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl text-gold mb-4">{nombre}</h1>
            <p className="text-muted text-lg mb-8 leading-relaxed">{tLocalized(chica.descripcion, lang)}</p>

            <a href={wa} target="_blank" rel="noopener" className="inline-block px-8 py-3 bg-gold text-bg text-xs font-semibold tracking-widest uppercase hover:bg-gold-light transition-colors mb-12">
              {ui('contactWhatsapp', lang)}
            </a>

            {servicios.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl text-gold mb-4">{ui('specialties', lang)}</h2>
                <ul className="space-y-3">
                  {servicios.map((s) => (
                    <li key={s.id} className="flex justify-between border-b border-border pb-2">
                      <span>{tLocalized(s.nombre, lang)}</span>
                      <span className="text-gold-light">{formatCop(s.precio, lang)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {chica.dias.length > 0 && (
              <section>
                <h2 className="text-xl text-gold mb-4">{ui('schedule', lang)}</h2>
                <ul className="space-y-2 text-sm text-muted">
                  {chica.dias.map((d) => {
                    const h = chica.horarios[d];
                    return (
                      <li key={d} className="flex justify-between">
                        <span>{DIA_LABELS[d][lang]}</span>
                        <span>{h ? `${h.inicio} – ${h.fin}` : '—'}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer contacto={content.contacto} />
    </>
  );
}

export default function ChicaProfilePage({ slug }: Props) {
  return (
    <PublicShell>
      <ChicaProfileContent slug={slug} />
    </PublicShell>
  );
}
