import { useState } from 'react';
import type { Product, ProductFormData, SearchFrequency } from '../../types';
import { Button } from '../ui/Button';

const FREQUENCIES: { value: SearchFrequency; label: string }[] = [
  { value: 'manual', label: 'Manual only' },
  { value: 'daily',  label: 'Daily' },
  { value: '12h',    label: 'Every 12 hours' },
  { value: '6h',     label: 'Every 6 hours' },
];

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    ProductName:     initialData?.ProductName ?? '',
    AmazonASIN:      initialData?.AmazonASIN ?? '',
    TargetPrice:     initialData?.TargetPrice ?? 0,
    SearchEnabled:   initialData?.SearchEnabled ?? true,
    SearchFrequency: initialData?.SearchFrequency ?? 'daily',
    Notes:           initialData?.Notes ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ProductName.trim()) { setError('Product name is required.'); return; }
    if (!form.TargetPrice || form.TargetPrice <= 0) { setError('Target price must be greater than 0.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit(form);
    } catch {
      setError('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          type="text"
          value={form.ProductName}
          onChange={e => set('ProductName', e.target.value)}
          placeholder="e.g. Sony WH-1000XM5"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amazon ASIN (optional)</label>
        <input
          type="text"
          value={form.AmazonASIN ?? ''}
          onChange={e => set('AmazonASIN', e.target.value)}
          placeholder="e.g. B09XS7JWHH"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (USD) *</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={form.TargetPrice || ''}
          onChange={e => set('TargetPrice', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Search Frequency</label>
        <select
          value={form.SearchFrequency}
          onChange={e => set('SearchFrequency', e.target.value as SearchFrequency)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          {FREQUENCIES.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="searchEnabled"
          checked={form.SearchEnabled}
          onChange={e => set('SearchEnabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label htmlFor="searchEnabled" className="text-sm font-medium text-gray-700">
          Search enabled
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          value={form.Notes ?? ''}
          onChange={e => set('Notes', e.target.value)}
          rows={2}
          placeholder="Any additional notes..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
