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
        <div className="inline-block px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full text-sm text-purple-200 mb-4">
          {COPY.ROLEPLAY_DISCLAIMER}
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          RF-FALCON-IDS
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          High-end roleplay identification ordering system. Professional-grade design for immersive roleplay experiences.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate({ to: '/signin' })}
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-card/50 border-cyan-500/20">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold">Sign In</h3>
              <p className="text-sm text-muted-foreground">
                Create an account with username and password
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-cyan-500/20">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold">Create Order</h3>
              <p className="text-sm text-muted-foreground">
                Fill out ID details and upload your photo
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-cyan-500/20">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold">Review</h3>
              <p className="text-sm text-muted-foreground">
                Preview your ID card and export/print
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-cyan-500/20">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold">Track Status</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your order through the dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Important Notice */}
      <section className="max-w-3xl mx-auto">
        <Card className="bg-purple-900/20 border-purple-500/30">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-xl font-bold text-center text-purple-200">Important Notice</h3>
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
