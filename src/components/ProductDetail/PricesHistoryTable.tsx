import { format } from 'date-fns';
import type { PricesHistory } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface PricesHistoryTableProps {
  history: PricesHistory[];
}

export function PricesHistoryTable({ history }: PricesHistoryTableProps) {
  if (history.length === 0) {
    return (
      <EmptyState
        title="No price matches yet"
        description="This section shows prices that met the target."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Date', 'Price', 'Target', 'Savings', 'Below Target', 'Product'].map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {history.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                {format(new Date(row.Date), 'MMM d, yyyy HH:mm')}
              </td>
              <td className="px-3 py-2.5 font-semibold text-green-600">${row.Price.toFixed(2)}</td>
              <td className="px-3 py-2.5 text-gray-600">${row.TargetPrice.toFixed(2)}</td>
              <td className="px-3 py-2.5 text-green-600 font-medium">
                -${(row.TargetPrice - row.Price).toFixed(2)}
              </td>
              <td className="px-3 py-2.5">
                {row.BelowTarget
                  ? <CheckCircle className="h-4 w-4 text-green-500" />
                  : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[200px] truncate">
                {row.ResultTitle && row.Url
                  ? <a href={row.Url} target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                      <span className="truncate">{row.ResultTitle}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  : row.ResultTitle ?? row.ProductName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
