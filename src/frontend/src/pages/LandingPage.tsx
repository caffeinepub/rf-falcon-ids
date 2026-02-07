import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, Truck, CheckCircle } from 'lucide-react';
import { COPY } from '../content/copy';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 py-8 sm:py-12">
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src="/assets/generated/falcon-ids-wordmark-gothic-transparent.dim_1200x300.png"
            alt="Falcon IDs"
            className="h-20 sm:h-24 w-auto max-w-full px-4"
          />
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          High-end identification ordering system. Professional-grade design and secure processing.
        </p>
        <div className="flex gap-4 justify-center pt-4 px-4">
          <Button
            onClick={() => navigate({ to: '/signin' })}
            size="lg"
            className="bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
          >
            Get Started
          </Button>
        </div>
        <div className="max-w-2xl mx-auto mt-8 px-4">
          <div className="bg-card/60 border border-chrome-300/10 rounded p-4 text-sm text-chrome-400">
            {COPY.LANDING_DISCLAIMER}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-6 sm:space-y-8 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-wider">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-card/80 border-chrome-300/20 hover:shadow-chrome-glow transition-shadow">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-chrome-900/50 rounded-full flex items-center justify-center mx-auto border border-chrome-300/20">
                <Shield className="w-6 h-6 text-chrome-300" />
              </div>
              <h3 className="font-semibold tracking-wide">Sign In</h3>
              <p className="text-sm text-muted-foreground">
                Authenticate securely with Internet Identity
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-chrome-300/20 hover:shadow-chrome-glow transition-shadow">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-chrome-900/50 rounded-full flex items-center justify-center mx-auto border border-chrome-300/20">
                <FileText className="w-6 h-6 text-chrome-300" />
              </div>
              <h3 className="font-semibold tracking-wide">Create Order</h3>
              <p className="text-sm text-muted-foreground">
                Fill out ID details and upload your photo
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-chrome-300/20 hover:shadow-chrome-glow transition-shadow">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-chrome-900/50 rounded-full flex items-center justify-center mx-auto border border-chrome-300/20">
                <CheckCircle className="w-6 h-6 text-chrome-300" />
              </div>
              <h3 className="font-semibold tracking-wide">Review</h3>
              <p className="text-sm text-muted-foreground">
                Preview your ID card and export/print
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-chrome-300/20 hover:shadow-chrome-glow transition-shadow">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-chrome-900/50 rounded-full flex items-center justify-center mx-auto border border-chrome-300/20">
                <Truck className="w-6 h-6 text-chrome-300" />
              </div>
              <h3 className="font-semibold tracking-wide">Track Status</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your order through the dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
