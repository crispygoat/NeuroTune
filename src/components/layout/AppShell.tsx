import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  backgroundColor?: string;
}

export function AppShell({ children, backgroundColor }: AppShellProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: backgroundColor || '#0a0e27' }}
    >
      {!backgroundColor && (
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy to-navy-deep opacity-80" />
      )}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
