import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <RefreshCw className="h-3 w-3" />
          Live data
        </div>
      </div>
    </header>
  );
}
