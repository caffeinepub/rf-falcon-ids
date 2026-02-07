import { ReactNode } from 'react';
import BrandHeader from './BrandHeader';
import NoveltyDisclaimerBanner from './NoveltyDisclaimerBanner';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NoveltyDisclaimerBanner />
      <BrandHeader />
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">{children}</main>
      <footer className="border-t border-chrome-300/20 bg-card/80 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026. Built with love using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-chrome-300 transition-colors">caffeine.ai</a></p>
        </div>
      </footer>
    </div>
  );
}
