import { format } from 'date-fns';
import type { ProcessHistory } from '../../types';
import { ResultTypeBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { ExternalLink } from 'lucide-react';

interface ProcessHistoryTableProps {
  history: ProcessHistory[];
}

export function ProcessHistoryTable({ history }: ProcessHistoryTableProps) {
  if (history.length === 0) {
    return <EmptyState title="No search history yet" description="Run a search to see results here." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Date', 'Attempt', 'Result', 'Price', 'Target', 'Title', 'Source'].map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {history.map(row => (
            <tr key={row.RunId} className="hover:bg-gray-50">
              <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                {format(new Date(row.SearchDate), 'MMM d, HH:mm')}
              </td>
              <td className="px-3 py-2.5 text-center font-medium text-gray-700">
                #{row.AttemptNumber}
              </td>
              <td className="px-3 py-2.5">
                <ResultTypeBadge type={row.ResultType} />
              </td>
              <td className="px-3 py-2.5 font-medium">
                {row.CurrentPrice != null ? (
                  <span className={row.CurrentPrice <= row.TargetPrice ? 'text-green-600' : 'text-gray-700'}>
                    ${row.CurrentPrice.toFixed(2)}
                  </span>
                ) : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-3 py-2.5 text-gray-600">${row.TargetPrice.toFixed(2)}</td>
              <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[200px] truncate">
                {row.ResultTitle
                  ? row.Url
                    ? <a href={row.Url} target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                        <span className="truncate">{row.ResultTitle}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    : row.ResultTitle
                  : row.ErrorMessage
                    ? <span className="text-red-500">{row.ErrorMessage}</span>
                    : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-3 py-2.5 text-xs text-gray-400">{row.Source ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
