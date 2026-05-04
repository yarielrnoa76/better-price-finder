import { type ReactNode } from 'react';
import { PackageSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title = 'No data',
  description,
  icon = <PackageSearch className="h-10 w-10 text-gray-300" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <p className="mt-3 text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
