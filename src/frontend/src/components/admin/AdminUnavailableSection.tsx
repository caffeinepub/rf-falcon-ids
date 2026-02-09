import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface AdminUnavailableSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function AdminUnavailableSection({
  title,
  description = 'This feature is not currently available.',
  icon,
}: AdminUnavailableSectionProps) {
  return (
    <Card className="bg-admin-card border-admin-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-admin-foreground flex items-center gap-2">
          {icon || <AlertTriangle className="w-5 h-5 text-admin-primary" />}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-admin-muted">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto text-admin-muted mb-4" />
          <p className="text-admin-muted text-lg font-medium">Not Available</p>
          <p className="text-admin-muted/70 text-sm mt-2">
            This feature is coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
