import { useState, useMemo } from 'react';
import { useAuditLog } from '../../hooks/admin/useAuditLog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search, AlertTriangle } from 'lucide-react';

export default function AuditLogSection() {
  const { data: auditLog, isLoading, error, refetch } = useAuditLog(100);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLog = useMemo(() => {
    if (!auditLog) return [];
    if (!searchQuery.trim()) return auditLog;

    const query = searchQuery.toLowerCase();
    return auditLog.filter(entry =>
      entry.action.toLowerCase().includes(query) ||
      entry.details.toLowerCase().includes(query) ||
      entry.admin.toText().toLowerCase().includes(query)
    );
  }, [auditLog, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full bg-admin-card" />
        <Skeleton className="h-32 w-full bg-admin-card" />
        <Skeleton className="h-32 w-full bg-admin-card" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive">Error loading audit log</p>
            <p className="text-admin-muted text-sm mt-2">{(error as Error).message}</p>
            <Button
              onClick={() => refetch()}
              className="mt-4 bg-admin-primary hover:bg-admin-primary/90"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-admin-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-admin-primary" />
            Audit Log
          </CardTitle>
          <CardDescription className="text-admin-muted">
            Track all administrative actions and system changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-admin-muted text-xs uppercase tracking-wider">
              <Search className="w-3 h-3 inline mr-1" />
              Search Audit Log
            </Label>
            <Input
              placeholder="Search by action, details, or admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-admin-bg border-admin-border text-admin-foreground focus:ring-admin-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-admin-foreground">
            Recent Actions ({filteredLog.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLog.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-admin-muted mb-4" />
              <p className="text-admin-muted">
                {searchQuery ? 'No audit entries match your search' : 'No audit entries yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredLog.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 bg-admin-bg border border-admin-border rounded-lg hover:border-admin-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-admin-foreground font-semibold">{entry.action}</p>
                        <span className="text-admin-muted text-xs">
                          {new Date(Number(entry.timestamp) / 1_000_000).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-admin-muted text-sm mb-2">{entry.details}</p>
                      <p className="text-admin-muted text-xs truncate" title={entry.admin.toText()}>
                        Admin: {entry.admin.toText()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
