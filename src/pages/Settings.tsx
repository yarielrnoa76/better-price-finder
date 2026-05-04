import { useState } from 'react';
import { Save, Eye, EyeOff, Info } from 'lucide-react';
import { TopBar } from '../components/Layout/TopBar';
import { Button } from '../components/ui/Button';

interface SettingField {
  key: string;
  label: string;
  placeholder: string;
  description?: string;
  readOnly?: boolean;
  secret?: boolean;
  envVar: string;
}

const FIELDS: SettingField[] = [
  {
    key: 'webhookUrl',
    label: 'n8n Webhook URL',
    placeholder: 'https://your-n8n.com/webhook/...',
    description: 'The webhook endpoint in your n8n workflow that receives product search requests.',
    envVar: 'VITE_N8N_WEBHOOK_URL',
  },
  {
    key: 'productsSheetId',
    label: 'Products Sheet ID',
    placeholder: 'Google Sheet ID for the Products tab',
    description: 'Found in the Google Sheets URL: .../spreadsheets/d/<SHEET_ID>/...',
    envVar: 'VITE_GOOGLE_PRODUCTS_SHEET_ID',
  },
  {
    key: 'processHistorySheetId',
    label: 'ProcessHistory Sheet ID',
    placeholder: 'Google Sheet ID for the ProcessHistory tab',
    envVar: 'VITE_GOOGLE_PROCESS_HISTORY_SHEET_ID',
  },
  {
    key: 'pricesHistorySheetId',
    label: 'PricesHistory Sheet ID',
    placeholder: 'Google Sheet ID for the PricesHistory tab',
    envVar: 'VITE_GOOGLE_PRICES_HISTORY_SHEET_ID',
  },
  {
    key: 'googleApiKey',
    label: 'Google Sheets API Key',
    placeholder: 'AIzaSy...',
    description: 'Read-only API key from Google Cloud Console.',
    secret: true,
    envVar: 'VITE_GOOGLE_SHEETS_API_KEY',
  },
  {
    key: 'defaultEmail',
    label: 'Default Alert Email',
    placeholder: 'you@example.com',
    description: 'Email address that receives price alerts.',
    envVar: 'VITE_DEFAULT_ALERT_EMAIL',
  },
];

const READONLY_FIELDS = [
  { label: 'Search provider', value: 'SerpAPI (via n8n)' },
  { label: 'Data mode', value: import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'Mock data (VITE_USE_MOCK_DATA=true)' : 'Live Google Sheets' },
  { label: 'App version', value: '0.1.0' },
];

export default function Settings() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  function toggleSecret(key: string) {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Settings" subtitle="Configure integrations and environment variables" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Settings are managed via environment variables in your <code className="font-mono bg-blue-100 px-1 rounded">.env</code> file.
              Copy <code className="font-mono bg-blue-100 px-1 rounded">.env.example</code> to <code className="font-mono bg-blue-100 px-1 rounded">.env</code> and fill in the values,
              then restart the dev server.
            </p>
          </div>

          {/* Editable fields (display-only, real values from env) */}
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Integration Settings</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {FIELDS.map(field => {
                const envValue = import.meta.env[field.envVar] ?? '';
                const isSecret = field.secret;
                const revealed = showSecrets[field.key];
                return (
                  <div key={field.key} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                      <span className="text-xs font-mono text-gray-400">{field.envVar}</span>
                    </div>
                    {field.description && (
                      <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                    )}
                    <div className="relative">
                      <input
                        type={isSecret && !revealed ? 'password' : 'text'}
                        readOnly
                        value={envValue || ''}
                        placeholder={envValue ? '' : `Not set — add to .env: ${field.envVar}=...`}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 font-mono pr-10"
                      />
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleSecret(field.key)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    {!envValue && (
                      <p className="text-xs text-orange-500 mt-1">⚠ Not configured</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t bg-gray-50 rounded-b-xl">
              <Button type="submit" icon={<Save className="h-4 w-4" />}>
                {saved ? 'Saved!' : 'Save Settings'}
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Note: Values shown above are read from environment variables and cannot be edited here.
                Modify your <code className="font-mono">.env</code> file directly.
              </p>
            </div>
          </form>

          {/* Read-only info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-800">System Info</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {READONLY_FIELDS.map(f => (
                <div key={f.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-gray-600">{f.label}</span>
                  <span className="text-sm font-medium text-gray-800">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
