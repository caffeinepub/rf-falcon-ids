import { useState } from 'react';
import { useListAdminEmails, useGrantAdminAccess, useRevokeAdminAccess } from '../../hooks/admin/useAdminAccess';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Users, Trash2, Loader2, Shield, AlertTriangle } from 'lucide-react';

export default function AdminAccessSection() {
  const { data: adminEmails, isLoading, error, refetch } = useListAdminEmails();
  const grantAccess = useGrantAdminAccess();
  const revokeAccess = useRevokeAdminAccess();

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);

  const handleGrantAccess = async () => {
    const email = newAdminEmail.trim();
    if (!email) {
      return;
    }

    try {
      await grantAccess.mutateAsync(email);
      setNewAdminEmail('');
    } catch (error) {
      // Error is already handled by the mutation's onError
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !grantAccess.isPending && newAdminEmail.trim()) {
      e.preventDefault();
      handleGrantAccess();
    }
  };

  const handleRevokeAccess = async (email: string) => {
    setRevokingEmail(email);
    try {
      await revokeAccess.mutateAsync(email);
    } catch (error) {
      // Error is already handled by the mutation's onError
    } finally {
      setRevokingEmail(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full bg-admin-card" />
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
            <p className="text-destructive">Error loading admin access list</p>
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
            <Shield className="w-5 h-5 text-admin-primary" />
            Admin Access Management
          </CardTitle>
          <CardDescription className="text-admin-muted">
            Any admin can grant or revoke administrator privileges. The owner account cannot be revoked.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Grant Access */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-admin-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-admin-primary" />
            Grant Admin Access
          </CardTitle>
          <CardDescription className="text-admin-muted">
            Add a new administrator by email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-admin-muted text-xs uppercase tracking-wider">
              Email Address
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={grantAccess.isPending}
              className="bg-admin-bg border-admin-border text-admin-foreground focus:ring-admin-primary"
            />
          </div>
          <Button
            onClick={handleGrantAccess}
            disabled={grantAccess.isPending || !newAdminEmail.trim()}
            className="w-full bg-admin-primary hover:bg-admin-primary/90"
          >
            {grantAccess.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Granting Access...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Grant Admin Access
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-admin-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-admin-primary" />
            Current Administrators ({adminEmails?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!adminEmails || adminEmails.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-admin-muted mb-4" />
              <p className="text-admin-muted">No administrators found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {adminEmails.map((email) => {
                const isOwner = email === 'traviscastonguay@gmail.com';
                const isRevoking = revokingEmail === email;

                return (
                  <div
                    key={email}
                    className="flex items-center justify-between p-4 bg-admin-bg border border-admin-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-admin-primary" />
                      <div>
                        <p className="text-admin-foreground font-medium">{email}</p>
                        {isOwner && (
                          <Badge className="mt-1 bg-admin-primary/20 text-admin-primary border-admin-primary/30">
                            Owner
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isRevoking}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {isRevoking ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Admin Access</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke admin access for {email}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevokeAccess(email)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Revoke Access
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
