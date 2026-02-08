import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1 min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wider break-words">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0 w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
