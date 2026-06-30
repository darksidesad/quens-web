import { useLang } from '../lib/lang';

export function LangToggle() {
  const { lang, toggleLang } = useLang();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="px-3 py-1 text-xs font-semibold tracking-widest uppercase border border-gold/40 text-gold hover:bg-gold hover:text-bg transition-colors"
      aria-label="Toggle language"
    >
      {lang === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
