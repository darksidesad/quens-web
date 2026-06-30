import type { ReactNode } from 'react';
import { LangProvider } from '../lib/lang';
import { SiteBackground } from './SiteBackground';
import { WhatsAppFab } from './WhatsAppFab';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <SiteBackground>{children}</SiteBackground>
      <WhatsAppFab />
    </LangProvider>
  );
}
