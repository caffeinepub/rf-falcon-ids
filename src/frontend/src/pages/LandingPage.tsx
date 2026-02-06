import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, Truck, CheckCircle } from 'lucide-react';
import { COPY } from '../content/copy';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 py-12">
        <div className="inline-block px-4 py-2 bg-card/80 border border-chrome-300/20 rounded text-sm text-chrome-300 mb-4 font-medium tracking-wide">
          {COPY.NOVELTY_DISCLAIMER}
        </div>
        <div className="flex justify-center mb-8">
          <img
            src="/assets/generated/falcon-ids-logo-transparent.dim_1200x300.png"
            alt="Falcon IDs"
            className="h-24 w-auto"
          />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          High-end novelty identification ordering system. Professional-grade design for entertainment experiences.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate({ to: '/signin' })}
            size="lg"
            className="bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center tracking-wider">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
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

      {/* Important Notice */}
      <section className="max-w-3xl mx-auto">
        <Card className="bg-card/80 border-chrome-300/20">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-xl font-bold text-center text-chrome-300 tracking-wider">Important Notice</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{COPY.LANDING_DISCLAIMER_1}</p>
              <p>{COPY.LANDING_DISCLAIMER_2}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
