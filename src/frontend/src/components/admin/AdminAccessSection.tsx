import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Loader2, Shield, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useListAdminEmails, useGrantAdminAccess, useRevokeAdminAccess } from '../../hooks/admin/useAdminAccess';
import { useCallerUserProfile } from '../../hooks/auth/useCallerUserProfile';

const OWNER_EMAIL = 'traviscastonguay@gmail.com';

export default function AdminAccessSection() {
  const { data: adminEmails, isLoading: emailsLoading } = useListAdminEmails();
  const { data: userProfile } = useCallerUserProfile();
  const grantAccess = useGrantAdminAccess();
  const revokeAccess = useRevokeAdminAccess();

  const [emailInput, setEmailInput] = useState('');

  const isOwner = userProfile?.email === OWNER_EMAIL;

  const handleGrantAccess = async () => {
    const email = emailInput.trim();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    if (!isOwner) {
      toast.error('Unauthorized: Only the owner can grant admin access');
      return;
    }

    try {
      await grantAccess.mutateAsync(email);
      toast.success(`Admin access granted to ${email}`);
      setEmailInput('');
    } catch (error: any) {
      console.error('Grant access error:', error);
      if (error.message?.includes('Unauthorized')) {
        toast.error('Unauthorized: Only the owner can grant admin access');
      } else if (error.message?.includes('not found') || error.message?.includes('not yet associated')) {
        toast.error('Email not found: User must sign up and set their email first');
      } else {
        toast.error(error.message || 'Failed to grant admin access');
      }
    }
  };

  const handleRevokeAccess = async (email: string) => {
    if (!isOwner) {
      toast.error('Unauthorized: Only the owner can revoke admin access');
      return;
    }

    if (email === OWNER_EMAIL) {
      toast.error('Cannot revoke owner admin access');
      return;
    }

    try {
      await revokeAccess.mutateAsync(email);
      toast.success(`Admin access revoked for ${email}`);
    } catch (error: any) {
      console.error('Revoke access error:', error);
      toast.error(error.message || 'Failed to revoke admin access');
    }
  };

  if (emailsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyber-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-cyber-card rounded-lg flex items-center justify-center border border-cyber-primary/30 shadow-cyber">
          <UserPlus className="w-7 h-7 text-cyber-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-cyber-primary font-mono uppercase">
            Admin Access Management
          </h2>
          <p className="text-cyber-muted mt-1 font-mono text-sm">
            [OWNER-ONLY CONTROL PANEL]
          </p>
        </div>
      </div>

      {/* Grant Access Form */}
      <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
        <CardHeader>
          <CardTitle className="text-cyber-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Grant Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOwner && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm font-mono">
                ⚠ Only the owner ({OWNER_EMAIL}) can grant admin access
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Email Address
            </Label>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="user@example.com"
              className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono"
              disabled={!isOwner}
            />
            <p className="text-cyber-muted text-xs font-mono">
              Note: User must already be registered with this email in the system
            </p>
          </div>
          <Button
            onClick={handleGrantAccess}
            disabled={!isOwner || grantAccess.isPending || !emailInput.trim()}
            className="w-full bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/50 text-cyber-primary font-mono"
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

      {/* Current Admins List */}
      <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
        <CardHeader>
          <CardTitle className="text-cyber-primary font-mono uppercase tracking-wider">
            Current Admin Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminEmails && adminEmails.length > 0 ? (
            <div className="space-y-2">
              {adminEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-3 bg-cyber-bg rounded-lg border border-cyber-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-cyber-primary" />
                    <span className="text-cyber-primary font-mono text-sm">{email}</span>
                    {email === OWNER_EMAIL && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-mono text-xs">
                        OWNER
                      </Badge>
                    )}
                  </div>
                  {email !== OWNER_EMAIL && isOwner && (
                    <Button
                      onClick={() => handleRevokeAccess(email)}
                      disabled={revokeAccess.isPending}
                      variant="destructive"
                      size="sm"
                      className="font-mono text-xs"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cyber-muted text-sm font-mono text-center py-4">
              No admin emails found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
