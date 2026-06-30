import type { ReactNode } from 'react';
import { LangProvider } from '../lib/lang';
import { SiteBackground } from './SiteBackground';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <SiteBackground>{children}</SiteBackground>
    </LangProvider>
  );
}
