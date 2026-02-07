import { useState, useMemo } from 'react';
import { useAuditLog } from '../../hooks/admin/useAuditLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, Search } from 'lucide-react';

export default function AuditLogSection() {
  const { data: auditLog, isLoading } = useAuditLog(100);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLog = useMemo(() => {
    if (!auditLog) return [];
    if (!searchQuery.trim()) return auditLog;

    const query = searchQuery.toLowerCase();
    return auditLog.filter(
      (entry) =>
        entry.action.toLowerCase().includes(query) ||
        entry.details.toLowerCase().includes(query) ||
        entry.admin.toString().toLowerCase().includes(query)
    );
  }, [auditLog, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-cyber-card rounded-lg flex items-center justify-center border border-cyber-primary/30 shadow-cyber">
          <FileText className="w-7 h-7 text-cyber-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-cyber-primary font-mono uppercase">
            Admin Audit Log
          </h2>
          <p className="text-cyber-muted mt-1 font-mono text-sm">
            [SYSTEM ACTIVITY MONITORING]
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
              <Search className="w-3 h-3 inline mr-1" />
              Search Audit Log
            </Label>
            <Input
              placeholder="Action, details, admin principal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
        <CardHeader>
          <CardTitle className="text-cyber-primary font-mono uppercase tracking-wider">
            Recent Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyber-primary" />
            </div>
          ) : !filteredLog || filteredLog.length === 0 ? (
            <div className="text-center py-12 text-cyber-muted font-mono text-sm">
              {searchQuery ? 'No matching audit entries found' : 'No audit entries recorded'}
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyber-primary/20">
                    <TableHead className="text-cyber-muted font-mono text-xs">Timestamp</TableHead>
                    <TableHead className="text-cyber-muted font-mono text-xs">Admin</TableHead>
                    <TableHead className="text-cyber-muted font-mono text-xs">Action</TableHead>
                    <TableHead className="text-cyber-muted font-mono text-xs">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLog.map((entry, idx) => (
                    <TableRow key={idx} className="border-cyber-primary/10">
                      <TableCell className="text-cyber-primary font-mono text-xs">
                        {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-cyber-primary font-mono text-xs truncate max-w-[200px]">
                        {entry.admin.toString().slice(0, 20)}...
                      </TableCell>
                      <TableCell className="text-cyber-accent font-mono text-xs font-semibold">
                        {entry.action}
                      </TableCell>
                      <TableCell className="text-cyber-muted font-mono text-xs">
                        {entry.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
