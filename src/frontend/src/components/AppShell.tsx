import { ReactNode } from 'react';
import BrandHeader from './BrandHeader';
import NoveltyDisclaimerBanner from './NoveltyDisclaimerBanner';
import { SiCoffeescript } from 'react-icons/si';
import { Heart } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NoveltyDisclaimerBanner />
      <BrandHeader />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-chrome-300/20 bg-card/80 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            © 2026. Built with{' '}
            <Heart className="w-4 h-4 text-chrome-300 fill-chrome-300" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-chrome-300 hover:text-chrome-200 transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
