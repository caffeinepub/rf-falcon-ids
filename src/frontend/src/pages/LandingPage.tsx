import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, Lock, ArrowRight, Clock } from 'lucide-react';
import { getAssetUrl } from '@/utils/assetBase';
import { LANDING_DELIVERY_TIME } from '@/content/copy';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative -mt-6 sm:-mt-8">
      {/* Hero Section with Gradient Background */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Modern Gradient Background Layers - non-interactive */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-primary/30 to-transparent blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-accent/30 to-transparent blur-3xl animate-float-delayed" />
          {/* Subtle noise texture */}
          <div className="absolute inset-0 bg-noise opacity-[0.02]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in text-center lg:text-left">
            <div className="space-y-6">
              <h1 
                id="hero-heading"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-foreground leading-[1.1]"
              >
                RF FALCON IDS
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Premium Novelty Identification Cards
              </p>
              
              {/* Delivery Time Badge */}
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3 text-primary">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                  <span className="font-semibold text-lg">{LANDING_DELIVERY_TIME}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center relative z-20">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/signin' })}
                className="text-lg px-10 py-7 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-xl font-semibold transition-all hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 h-6 w-6" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/features' })}
                className="text-lg px-10 py-7 h-auto border-2 hover:bg-accent/10 transition-all hover:scale-105"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Illustration - non-interactive */}
          <div className="relative animate-fade-in-delay hidden lg:block pointer-events-none">
            <div className="relative">
              {/* Decorative gradient orbs */}
              <img
                src={getAssetUrl('/assets/generated/gradient-orbs-pack.dim_1200x1200.png')}
                alt=""
                className="absolute -top-20 -right-20 w-[400px] h-[400px] opacity-30 animate-spin-slow"
                aria-hidden="true"
              />
              {/* Main hero illustration */}
              <img
                src={getAssetUrl('/assets/generated/hero-ai-illustration.dim_1600x900.png')}
                alt="Modern digital identification technology illustration"
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30" aria-labelledby="benefits-heading">
        <div className="container mx-auto px-4">
          <h2 id="benefits-heading" className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why Choose RF FALCON IDS?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-semibold">Premium Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  High-quality novelty IDs crafted with attention to detail and professional design standards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-all hover:shadow-glow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-8 h-8 text-accent" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-semibold">Fast Processing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quick turnaround times with efficient order processing and reliable delivery tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-semibold">Secure Platform</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your information is protected with modern security measures and encrypted data storage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground">
              Create your novelty ID card today with our simple and secure ordering process.
            </p>
            <Button
              size="lg"
              onClick={() => navigate({ to: '/signin' })}
              className="text-lg px-12 py-7 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-xl font-semibold transition-all hover:scale-105 relative z-20"
            >
              Order Now
              <ArrowRight className="ml-2 h-6 w-6" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
