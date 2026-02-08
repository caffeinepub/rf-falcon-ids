import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Award, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-foreground leading-tight">
          About Falcon IDs
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
          Pioneering the future of secure, decentralized identification systems powered by blockchain technology.
        </p>
      </section>

      {/* Mission Section */}
      <section className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-foreground">
            Our Mission
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing identification by combining cutting-edge blockchain technology with user-centric design, 
            delivering secure, fast, and verifiable ID solutions for the modern world.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          {[
            {
              icon: Shield,
              title: 'Security First',
              description: 'Built on Internet Computer blockchain with enterprise-grade encryption and decentralized authentication.',
            },
            {
              icon: Users,
              title: 'User Privacy',
              description: 'Your data belongs to you. We never sell or share your personal information with third parties.',
            },
            {
              icon: Award,
              title: 'Quality Standards',
              description: 'Professional-grade materials and design that meet the highest industry standards for identification.',
            },
            {
              icon: Target,
              title: 'Innovation Driven',
              description: 'Constantly evolving our platform with the latest technology to provide the best user experience.',
            },
          ].map((value, index) => (
            <Card 
              key={index}
              className="group bg-card/90 backdrop-blur border-border hover:shadow-glow-lg transition-all duration-500 hover:scale-105 hover:border-primary/50"
            >
              <CardContent className="pt-8 pb-6 space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all">
                  <value.icon className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-display font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-4xl mx-auto space-y-8 bg-muted/20 rounded-3xl p-8 sm:p-12">
        <h2 className="text-4xl sm:text-5xl font-display font-bold text-foreground text-center">
          Our Story
        </h2>
        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Founded in 2024, Falcon IDs emerged from a vision to transform the identification industry through 
            blockchain technology and decentralized systems. We recognized the need for a more secure, private, 
            and user-friendly approach to identity verification.
          </p>
          <p>
            Built on the Internet Computer blockchain, our platform leverages Internet Identity for authentication, 
            ensuring that users maintain complete control over their personal data while enjoying seamless access 
            to our services.
          </p>
          <p>
            Today, we serve thousands of customers worldwide, providing professional-grade identification solutions 
            that combine security, speed, and quality. Our commitment to innovation and user privacy continues to 
            drive everything we do.
          </p>
        </div>
      </section>
    </div>
  );
}
