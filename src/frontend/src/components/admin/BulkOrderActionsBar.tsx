import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BulkOrderActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export default function BulkOrderActionsBar({
  selectedCount,
  onClearSelection,
}: BulkOrderActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-admin-border bg-admin-card/95 backdrop-blur shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <Card className="bg-admin-bg border-admin-border">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-admin-foreground font-medium">
                  {selectedCount} {selectedCount === 1 ? 'order' : 'orders'} selected
                </p>
                <p className="text-admin-muted text-sm">
                  Bulk actions are not available
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-admin-muted hover:text-admin-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
