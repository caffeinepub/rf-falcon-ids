import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';
import { useAdminTheme, type AdminTheme } from '../../hooks/admin/useAdminTheme';

const THEME_LABELS: Record<AdminTheme, string> = {
  'goth-black': 'Goth Black',
  'silver-steel': 'Silver Steel',
  'white-luxury': 'White Luxury',
  'deep-purple': 'Deep Purple',
  'fire-red': 'Fire Red',
};

export default function AdminThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useAdminTheme();

  return (
    <div className="space-y-2">
      <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider flex items-center gap-2">
        <Palette className="w-3 h-3" />
        Admin Theme
      </Label>
      <Select value={theme} onValueChange={(v) => setTheme(v as AdminTheme)}>
        <SelectTrigger className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-cyber-card border-cyber-primary/30">
          {availableThemes.map((t) => (
            <SelectItem key={t} value={t} className="font-mono">
              {THEME_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
