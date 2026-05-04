import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Filter } from 'lucide-react';
import type { ProcessHistory, ResultType } from '../types';
import { getProcessHistory } from '../services/googleSheetsService';
import { TopBar } from '../components/Layout/TopBar';
import { ResultTypeBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ExternalLink } from 'lucide-react';

const RESULT_TYPES: { value: ResultType | 'ALL'; label: string }[] = [
  { value: 'ALL',          label: 'All' },
  { value: 'DESIRED_MATCH', label: 'Match' },
  { value: 'ABOVE_TARGET', label: 'Above Target' },
  { value: 'BEST_PROPOSAL', label: 'Best Proposal' },
  { value: 'NOT_FOUND',    label: 'Not Found' },
  { value: 'ERROR',        label: 'Error' },
];

export default function History() {
  const [history, setHistory] = useState<ProcessHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ResultType | 'ALL'>('ALL');

  useEffect(() => {
    getProcessHistory().then(data => { setHistory(data); setLoading(false); });
  }, []);

  const filtered = filter === 'ALL' ? history : history.filter(h => h.ResultType === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Search History" subtitle={`${history.length} total records`} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Filter bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b flex-wrap">
            <Filter className="h-4 w-4 text-gray-400" />
            {RESULT_TYPES.map(rt => (
              <button
                key={rt.value}
                onClick={() => setFilter(rt.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === rt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No records" description="Try changing the filter above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Product', 'Attempt', 'Result', 'Price', 'Target', 'Details', 'Source'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {filtered.map(row => (
                    <tr key={row.RunId} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(row.SearchDate), 'MMM d, HH:mm')}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{row.ProductName}</td>
                      <td className="px-4 py-2.5 text-center text-gray-600">#{row.AttemptNumber}</td>
                      <td className="px-4 py-2.5"><ResultTypeBadge type={row.ResultType} /></td>
                      <td className="px-4 py-2.5 font-medium">
                        {row.CurrentPrice != null
                          ? <span className={row.CurrentPrice <= row.TargetPrice ? 'text-green-600' : 'text-gray-700'}>
                              ${row.CurrentPrice.toFixed(2)}
                            </span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">${row.TargetPrice.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 max-w-[180px] truncate">
                        {row.ResultTitle && row.Url ? (
                          <a href={row.Url} target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                            <span className="truncate">{row.ResultTitle}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : row.ErrorMessage ? (
                          <span className="text-red-500">{row.ErrorMessage}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{row.Source ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
