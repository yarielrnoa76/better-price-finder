import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Package, PauseCircle, CheckCircle, Bell, TrendingDown, Clock } from 'lucide-react';
import type { Product, ProcessHistory, PricesHistory, DashboardStats } from '../types';
import { getProducts, getProcessHistory, getPricesHistory } from '../services/googleSheetsService';
import { TopBar } from '../components/Layout/TopBar';
import { ProductStatusBadge } from '../components/ui/StatusBadge';

function StatCard({ label, value, icon, color }: {
  label: string; value: number; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ totalActive: 0, totalPaused: 0, totalFound: 0, totalAlertSent: 0 });
  const [recentSearches, setRecentSearches] = useState<ProcessHistory[]>([]);
  const [recentPrices, setRecentPrices] = useState<PricesHistory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [prods, history, prices] = await Promise.all([
        getProducts(),
        getProcessHistory(),
        getPricesHistory(),
      ]);
      setProducts(prods);
      setStats({
        totalActive:   prods.filter(p => p.Status === 'ACTIVE').length,
        totalPaused:   prods.filter(p => p.Status === 'PAUSED').length,
        totalFound:    prods.filter(p => p.Status === 'FOUND').length,
        totalAlertSent: prods.filter(p => p.AlertSent).length,
      });
      setRecentSearches(history.slice(0, 6));
      setRecentPrices(prices.slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" subtitle="Overview of your price searches" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active searches" value={stats.totalActive}   icon={<Package className="h-5 w-5 text-blue-600" />}  color="bg-blue-50" />
          <StatCard label="Paused"          value={stats.totalPaused}   icon={<PauseCircle className="h-5 w-5 text-gray-500" />} color="bg-gray-50" />
          <StatCard label="Found"           value={stats.totalFound}    icon={<CheckCircle className="h-5 w-5 text-green-600" />} color="bg-green-50" />
          <StatCard label="Alerts sent"     value={stats.totalAlertSent} icon={<Bell className="h-5 w-5 text-purple-600" />}  color="bg-purple-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent searches */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-5 py-4 border-b">
              <Clock className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-800 text-sm">Recent Searches</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentSearches.map(h => (
                <div key={h.RunId} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <button
                      onClick={() => navigate(`/products/${h.ProductId}`)}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {h.ProductName}
                    </button>
                    <p className="text-xs text-gray-400">{h.SearchDate && !isNaN(new Date(h.SearchDate).getTime()) ? format(new Date(h.SearchDate), 'MMM d, HH:mm') : '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {h.CurrentPrice && <span className="text-sm font-medium text-gray-700">${h.CurrentPrice.toFixed(2)}</span>}
                    <ProductStatusBadge status={
                      h.ResultType === 'DESIRED_MATCH' ? 'FOUND'
                        : h.ResultType === 'BEST_PROPOSAL' ? 'BEST_PROPOSAL'
                        : h.ResultType === 'ERROR' ? 'ERROR'
                        : 'ACTIVE'
                    } />
                  </div>
                </div>
              ))}
              {recentSearches.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">No searches yet</p>
              )}
            </div>
          </div>

          {/* Recent prices found */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-5 py-4 border-b">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <h2 className="font-semibold text-gray-800 text-sm">Prices Below Target</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPrices.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.ProductName}</p>
                    <p className="text-xs text-gray-400">{p.Date && !isNaN(new Date(p.Date).getTime()) ? format(new Date(p.Date), 'MMM d, yyyy') : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">${p.Price.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">target: ${p.TargetPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {recentPrices.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">No prices below target yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Products overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-800 text-sm">All Products</h2>
            <button onClick={() => navigate('/products')} className="text-xs text-blue-600 hover:underline">
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {products.map(p => (
              <div key={p.ProductId} className="flex items-center justify-between px-5 py-3">
                <button
                  onClick={() => navigate(`/products/${p.ProductId}`)}
                  className="text-sm font-medium text-blue-600 hover:underline text-left"
                >
                  {p.ProductName}
                </button>
                <div className="flex items-center gap-3">
                  {p.LastPrice
                    ? <span className={`text-sm font-medium ${p.LastPrice <= p.TargetPrice ? 'text-green-600' : 'text-gray-600'}`}>
                        ${p.LastPrice.toFixed(2)}
                      </span>
                    : <span className="text-sm text-gray-400">—</span>}
                  <span className="text-xs text-gray-400">/ ${p.TargetPrice.toFixed(2)}</span>
                  <ProductStatusBadge status={p.Status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
