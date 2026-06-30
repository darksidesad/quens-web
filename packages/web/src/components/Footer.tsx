import type { Content } from '@quenns/shared';
import { tLocalized, ui } from '@quenns/shared';
import { useLang } from '../lib/lang';

interface FooterProps {
  contacto: Content['contacto'];
}

export function Footer({ contacto }: FooterProps) {
  const { lang } = useLang();

  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl text-gold tracking-widest mb-4">QUENNS</p>
          <p className="text-muted text-sm">{tLocalized(contacto.direccion, lang)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-2">{ui('hours', lang)}</p>
          <p className="text-muted text-sm">{tLocalized(contacto.horarios, lang)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-2">WhatsApp</p>
          <p className="text-muted text-sm">{contacto.whatsapp}</p>
          {contacto.instagram && (
            <a href={contacto.instagram} className="text-gold text-sm mt-2 inline-block hover:underline" target="_blank" rel="noopener">
              Instagram
            </a>
          )}
        </div>
      </div>
      <div className="gold-divider" />
      <p className="text-center text-muted text-xs py-6">&copy; {new Date().getFullYear()} Quenns Spa</p>
    </footer>
  );
}
