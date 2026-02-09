import { Outlet } from '@tanstack/react-router';
import BrandHeader from './BrandHeader';
import VipCongratsDialog from './VipCongratsDialog';
import TreyCSecurityProtectionModal from './TreyCSecurityProtectionModal';

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Subtle futuristic grid background - non-interactive */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)',
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <BrandHeader />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <Outlet />
        </main>

        <footer className="border-t bg-card/50 backdrop-blur-sm py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2026. Built with love using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">caffeine.ai</a>.</p>
          </div>
        </footer>
      </div>

      {/* VIP Congrats Dialog */}
      <VipCongratsDialog />
      
      {/* TREY-C Security Protection Modal */}
      <TreyCSecurityProtectionModal />
    </div>
  );
}
