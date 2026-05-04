import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, PlayCircle, Edit, History, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { Product } from '../../types';
import { ProductStatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';

interface ProductsTableProps {
  products: Product[];
  onToggleSearch: (product: Product) => Promise<void>;
  onRunSearch: (product: Product) => Promise<void>;
  onEdit: (product: Product) => void;
}

export function ProductsTable({ products, onToggleSearch, onRunSearch, onEdit }: ProductsTableProps) {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(product: Product) {
    setLoadingId(product.ProductId + '-toggle');
    await onToggleSearch(product);
    setLoadingId(null);
  }

  async function handleRun(product: Product) {
    setLoadingId(product.ProductId + '-run');
    await onRunSearch(product);
    setLoadingId(null);
  }

  if (products.length === 0) {
    return <p className="text-center text-gray-500 py-10 text-sm">No products found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Product', 'ASIN', 'Target', 'Last Price', 'Status', 'Last Search', 'Alert', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {products.map(product => (
            <tr key={product.ProductId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <button
                  onClick={() => navigate(`/products/${product.ProductId}`)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                >
                  {product.ProductName}
                </button>
                {product.Notes && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{product.Notes}</p>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                {product.AmazonASIN || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                ${product.TargetPrice.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm">
                {product.LastPrice ? (
                  <span className={product.LastPrice <= product.TargetPrice ? 'text-green-600 font-medium' : 'text-gray-700'}>
                    ${product.LastPrice.toFixed(2)}
                  </span>
                ) : <span className="text-gray-300">—</span>}
                {product.LastUrl && (
                  <a href={product.LastUrl} target="_blank" rel="noreferrer" className="ml-1 text-gray-400 hover:text-blue-500">
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                )}
              </td>
              <td className="px-4 py-3">
                <ProductStatusBadge status={product.Status} />
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {product.LastSearchAt ? format(new Date(product.LastSearchAt), 'MMM d, HH:mm') : '—'}
              </td>
              <td className="px-4 py-3 text-center">
                {product.AlertSent
                  ? <span className="text-xs text-green-600 font-medium">Sent</span>
                  : <span className="text-xs text-gray-400">No</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="h-3.5 w-3.5" />}
                    onClick={() => onEdit(product)}
                    title="Edit"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<History className="h-3.5 w-3.5" />}
                    onClick={() => navigate(`/products/${product.ProductId}`)}
                    title="View history"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={loadingId === product.ProductId + '-run'}
                    icon={<PlayCircle className="h-3.5 w-3.5 text-blue-500" />}
                    onClick={() => handleRun(product)}
                    title="Run search now"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={loadingId === product.ProductId + '-toggle'}
                    icon={product.SearchEnabled
                      ? <Pause className="h-3.5 w-3.5 text-orange-500" />
                      : <Play className="h-3.5 w-3.5 text-green-500" />}
                    onClick={() => handleToggle(product)}
                    title={product.SearchEnabled ? 'Pause search' : 'Resume search'}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
