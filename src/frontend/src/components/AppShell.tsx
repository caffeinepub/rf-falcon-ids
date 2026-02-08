import { ReactNode } from 'react';
import BrandHeader from './BrandHeader';
import NoveltyDisclaimerBanner from './NoveltyDisclaimerBanner';
import SeoHead from './SeoHead';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-chrome-300 focus:text-black focus:rounded focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>
      <NoveltyDisclaimerBanner />
      <BrandHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl focus:outline-none">
        {children}
      </main>
      <footer className="border-t border-chrome-300/20 py-6 sm:py-8 mt-auto" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>
            © 2026. Built with love using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-chrome-300 hover:text-chrome-200 transition-colors underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
