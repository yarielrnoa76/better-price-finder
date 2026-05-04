import type { ProductStatus, ResultType } from '../../types';

const productStatusConfig: Record<ProductStatus, { label: string; className: string }> = {
  ACTIVE:        { label: 'Active',         className: 'bg-blue-100 text-blue-800' },
  FOUND:         { label: 'Found',          className: 'bg-green-100 text-green-800' },
  BEST_PROPOSAL: { label: 'Best Proposal',  className: 'bg-yellow-100 text-yellow-800' },
  PAUSED:        { label: 'Paused',         className: 'bg-gray-100 text-gray-600' },
  ERROR:         { label: 'Error',          className: 'bg-red-100 text-red-800' },
};

const resultTypeConfig: Record<ResultType, { label: string; className: string }> = {
  DESIRED_MATCH: { label: 'Match',          className: 'bg-green-100 text-green-800' },
  BEST_PROPOSAL: { label: 'Best Proposal',  className: 'bg-yellow-100 text-yellow-800' },
  ABOVE_TARGET:  { label: 'Above Target',   className: 'bg-orange-100 text-orange-800' },
  NOT_FOUND:     { label: 'Not Found',      className: 'bg-gray-100 text-gray-600' },
  ERROR:         { label: 'Error',          className: 'bg-red-100 text-red-800' },
};

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const cfg = productStatusConfig[status] ?? productStatusConfig.ERROR;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

interface ResultTypeBadgeProps {
  type: ResultType;
}

export function ResultTypeBadge({ type }: ResultTypeBadgeProps) {
  const cfg = resultTypeConfig[type] ?? resultTypeConfig.ERROR;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
