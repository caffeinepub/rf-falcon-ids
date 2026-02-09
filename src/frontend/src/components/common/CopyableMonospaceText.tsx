import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyableMonospaceTextProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyableMonospaceText({ text, label, className = '' }: CopyableMonospaceTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      )}
      <div className="flex items-center gap-2 bg-muted p-3 rounded border border-border">
        <code className="flex-1 text-sm font-mono break-all">{text}</code>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="shrink-0 h-8 w-8"
          aria-label={`Copy ${label || 'text'}`}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
