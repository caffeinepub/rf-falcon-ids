import { Lock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function AdminOwnerIndicator() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">Owner</span>
            </div>
            <div className="text-sm text-muted-foreground font-mono break-all">
              traviscastonguay@gmail.com
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
