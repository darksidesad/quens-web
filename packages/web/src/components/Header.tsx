import { useLang } from '../lib/lang';
import { ui } from '@quenns/shared';
import { LangToggle } from './LangToggle';

export function Header() {
  const { lang } = useLang();

  const links = [
    { href: '/', label: ui('navHome', lang) },
    { href: '/servicios', label: ui('navServices', lang) },
    { href: '/chicas', label: ui('navTeam', lang) },
    { href: '/eventos', label: ui('navEvents', lang) },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-gold/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-[family-name:var(--font-display)] text-2xl tracking-[0.2em] text-gold">
          QUENNS
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-xs font-semibold tracking-widest uppercase text-muted hover:text-gold transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <LangToggle />
      </div>
    </header>
  );
}
