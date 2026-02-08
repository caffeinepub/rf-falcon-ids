import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="group bg-card/90 backdrop-blur border-border hover:shadow-glow-lg transition-all duration-500 hover:scale-105 hover:border-primary/50 hover:-translate-y-2">
      <CardContent className="pt-10 pb-8 space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all group-hover:scale-110 group-hover:rotate-6">
          <Icon className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-2xl font-display font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
