import { useEffect, useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Product, ProductFormData } from '../types';
import { getProducts, createProduct, updateProduct } from '../services/googleSheetsService';
import { triggerSearch } from '../services/n8nService';
import { TopBar } from '../components/Layout/TopBar';
import { ProductsTable } from '../components/Products/ProductsTable';
import { ProductForm } from '../components/Products/ProductForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? products.filter(p =>
          p.ProductName.toLowerCase().includes(q) ||
          (p.AmazonASIN?.toLowerCase().includes(q)) ||
          p.Status.toLowerCase().includes(q)
        )
      : products;
  }, [search, products]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    const data = await getProducts();
    setProducts(data);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleCreate(data: ProductFormData) {
    await createProduct(data);
    await refresh();
    setModalOpen(false);
    showToast('Product created successfully.');
  }

  async function handleEdit(data: ProductFormData) {
    if (!editTarget) return;
    const statusUpdate = data.SearchEnabled !== editTarget.SearchEnabled
      ? { Status: data.SearchEnabled ? ('ACTIVE' as const) : ('PAUSED' as const) }
      : {};
    await updateProduct(editTarget.ProductId, {
      ProductName:     data.ProductName,
      AmazonASIN:      data.AmazonASIN,
      TargetPrice:     data.TargetPrice,
      SearchEnabled:   data.SearchEnabled,
      Notes:           data.Notes,
      SearchFrequency: data.SearchFrequency,
      ...statusUpdate,
    });
    await refresh();
    setEditTarget(null);
    showToast('Product updated.');
  }

  async function handleToggleSearch(product: Product) {
    await updateProduct(product.ProductId, {
      SearchEnabled: !product.SearchEnabled,
      Status: !product.SearchEnabled ? 'ACTIVE' : 'PAUSED',
    });
    await refresh();
    showToast(`Search ${product.SearchEnabled ? 'paused' : 'resumed'} for ${product.ProductName}.`);
  }

  async function handleRunSearch(product: Product) {
    const result = await triggerSearch({
      ProductId:   product.ProductId,
      ProductName: product.ProductName,
      AmazonASIN:  product.AmazonASIN,
      TargetPrice: product.TargetPrice,
      ManualRun:   true,
    });
    showToast(result.message);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Products" subtitle="Error loading data" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-5 max-w-lg text-sm">
            <p className="font-semibold mb-1">Failed to load products</p>
            <p className="font-mono text-xs break-all">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Products"
        subtitle={`${products.length} products tracked`}
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            New Product
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-3 border-b flex items-center gap-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ASIN or status..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <ProductsTable
            products={filtered}
            onToggleSearch={handleToggleSearch}
            onRunSearch={handleRunSearch}
            onEdit={p => setEditTarget(p)}
          />
        </div>
      </div>

      {/* Create modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Product">
        <ProductForm
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Product">
        {editTarget && (
          <ProductForm
            initialData={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
