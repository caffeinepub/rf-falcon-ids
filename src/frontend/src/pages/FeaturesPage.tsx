import FeatureCard from '@/components/marketing/FeatureCard';
import { Sparkles, Zap, Shield, Globe, Award } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Design',
      description: 'Advanced algorithms ensure every ID meets professional standards with authentic-looking design and layout.',
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Internet Identity authentication ensures your data remains private and under your control.',
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: 'Lightning-fast order processing with real-time status updates and automated workflow management.',
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Premium materials and professional printing ensure your ID looks authentic and lasts.',
    },
    {
      icon: Globe,
      title: 'Global Delivery',
      description: 'Secure shipping worldwide with tracking numbers and delivery confirmation for peace of mind.',
    },
  ];

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-foreground leading-tight">
          Powerful Features
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
          Cutting-edge technology meets user-friendly design. Discover what makes Falcon IDs the premier choice 
          for secure identification.
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </section>
    </div>
  );
}
