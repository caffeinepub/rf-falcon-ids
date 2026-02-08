import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface InlineFieldMessageProps {
  id?: string;
  type?: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

export default function InlineFieldMessage({ id, type = 'error', children }: InlineFieldMessageProps) {
  const Icon = type === 'error' ? AlertCircle : type === 'success' ? CheckCircle2 : Info;
  
  const colorClasses = {
    error: 'text-red-400',
    success: 'text-green-400',
    info: 'text-blue-400',
  };

  return (
    <div id={id} className={`flex items-start gap-2 text-xs sm:text-sm ${colorClasses[type]} mt-1.5`} role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
