import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, PlayCircle, Pause, Play, ExternalLink,
  AlertTriangle, CheckCircle, Clock, Hash
} from 'lucide-react';
import type { Product, ProcessHistory, PricesHistory } from '../types';
import { getProducts, getProcessHistory, getPricesHistory, updateProduct } from '../services/googleSheetsService';
import { triggerSearch } from '../services/n8nService';
import { ProcessHistoryTable } from '../components/ProductDetail/ProcessHistoryTable';
import { PricesHistoryTable } from '../components/ProductDetail/PricesHistoryTable';
import { ProductStatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';

type Tab = 'process' | 'prices';

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [processHistory, setProcessHistory] = useState<ProcessHistory[]>([]);
  const [pricesHistory, setPricesHistory] = useState<PricesHistory[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('process');
  const [runLoading, setRunLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (productId) loadAll(productId); }, [productId]);

  async function loadAll(id: string) {
    setLoading(true);
    const [products, process, prices] = await Promise.all([
      getProducts(),
      getProcessHistory(id),
      getPricesHistory(id),
    ]);
    setProduct(products.find(p => p.ProductId === id) ?? null);
    setProcessHistory(process);
    setPricesHistory(prices);
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleRunSearch() {
    if (!product) return;
    setRunLoading(true);
    const result = await triggerSearch({
      ProductId:   product.ProductId,
      ProductName: product.ProductName,
      AmazonASIN:  product.AmazonASIN,
      TargetPrice: product.TargetPrice,
      ManualRun:   true,
    });
    setRunLoading(false);
    showToast(result.message);
  }

  async function handleToggle() {
    if (!product) return;
    setToggleLoading(true);
    await updateProduct(product.ProductId, {
      SearchEnabled: !product.SearchEnabled,
      Status: !product.SearchEnabled ? 'ACTIVE' : 'PAUSED',
    });
    await loadAll(product.ProductId);
    setToggleLoading(false);
    showToast(`Search ${product.SearchEnabled ? 'paused' : 'resumed'}.`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-gray-600">Product not found.</p>
        <Button variant="secondary" onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const bestProposal = product.Status === 'BEST_PROPOSAL';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <button onClick={() => navigate('/products')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900">{product.ProductName}</h1>
              <ProductStatusBadge status={product.Status} />
            </div>
            {product.AmazonASIN && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                <Hash className="h-3 w-3" />
                <span className="font-mono">{product.AmazonASIN}</span>
                <a
                  href={`https://amazon.com/dp/${product.AmazonASIN}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={toggleLoading}
              icon={product.SearchEnabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              onClick={handleToggle}
            >
              {product.SearchEnabled ? 'Pause' : 'Resume'}
            </Button>
            <Button
              size="sm"
              loading={runLoading}
              icon={<PlayCircle className="h-3.5 w-3.5" />}
              onClick={handleRunSearch}
            >
              Run Search Now
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Best Proposal Banner */}
        {bestProposal && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Best Proposal after 3 attempts</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                The target price of <strong>${product.TargetPrice.toFixed(2)}</strong> was never reached.
                The best price found was{' '}
                <strong>${product.LastPrice?.toFixed(2) ?? '—'}</strong>.
                {product.LastUrl && (
                  <a href={product.LastUrl} target="_blank" rel="noreferrer" className="ml-1.5 underline">
                    View listing
                  </a>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoCard label="Target Price" value={`$${product.TargetPrice.toFixed(2)}`} />
          <InfoCard
            label="Last Price"
            value={product.LastPrice ? `$${product.LastPrice.toFixed(2)}` : '—'}
            highlight={product.LastPrice != null && product.LastPrice <= product.TargetPrice}
          />
          <InfoCard
            label="Last Search"
            value={product.LastSearchAt ? format(new Date(product.LastSearchAt), 'MMM d, HH:mm') : '—'}
            icon={<Clock className="h-3.5 w-3.5 text-gray-400" />}
          />
          <InfoCard
            label="Alert Sent"
            value={product.AlertSent ? 'Yes' : 'No'}
            icon={product.AlertSent ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : undefined}
          />
        </div>

        {product.Notes && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Notes: </span>{product.Notes}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex border-b">
            {([
              { key: 'process', label: `Search History (${processHistory.length})` },
              { key: 'prices',  label: `Price Matches (${pricesHistory.length})` },
            ] as { key: Tab; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-4">
            {activeTab === 'process'
              ? <ProcessHistoryTable history={processHistory} />
              : <PricesHistoryTable history={pricesHistory} />
            }
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, highlight, icon }: {
  label: string; value: string; highlight?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className={`text-base font-semibold ${highlight ? 'text-green-600' : 'text-gray-800'}`}>{value}</p>
      </div>
    </div>
  );
}
