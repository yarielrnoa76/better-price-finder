import { useState } from 'react';
import { Save, Eye, EyeOff, Lock, Unlock, RotateCcw, ShieldCheck } from 'lucide-react';
import { TopBar } from '../components/Layout/TopBar';
import { Button } from '../components/ui/Button';
import {
  getSettings, saveSettings, resetSettings,
  getMasterPassword, isSessionUnlocked, unlockSession, lockSession,
  type AppSettings,
} from '../services/settingsService';

// ─── Password gate ────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === getMasterPassword()) {
      unlockSession();
      onUnlock();
    } else {
      setError('Incorrect password.');
      setInput('');
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Settings" subtitle="Access restricted" />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShieldCheck className="h-7 w-7 text-blue-600" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">Settings are protected</h2>
              <p className="text-sm text-gray-500 mt-1">Enter the master password to continue.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); }}
                placeholder="Master password"
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full justify-center" icon={<Unlock className="h-4 w-4" />}>
              Unlock Settings
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Settings form ────────────────────────────────────────────────────────────

interface FieldDef {
  key: keyof AppSettings;
  label: string;
  placeholder: string;
  description?: string;
  secret?: boolean;
  type?: 'text' | 'email' | 'checkbox';
}

const FIELDS: FieldDef[] = [
  {
    key: 'webhookUrl',
    label: 'n8n Webhook URL',
    placeholder: 'https://your-n8n.com/webhook/...',
    description: 'Must have CORS enabled for your Cloudflare Pages domain.',
  },
  {
    key: 'googleApiKey',
    label: 'Google Sheets API Key',
    placeholder: 'AIzaSy...',
    description: 'Read-only API key from Google Cloud Console.',
    secret: true,
  },
  {
    key: 'productsSheetId',
    label: 'Products Sheet ID',
    placeholder: 'Found in the Google Sheets URL',
    description: '.../spreadsheets/d/<SHEET_ID>/...',
  },
  {
    key: 'processHistorySheetId',
    label: 'ProcessHistory Sheet ID',
    placeholder: 'Found in the Google Sheets URL',
  },
  {
    key: 'pricesHistorySheetId',
    label: 'PricesHistory Sheet ID',
    placeholder: 'Found in the Google Sheets URL',
  },
  {
    key: 'defaultEmail',
    label: 'Default Alert Email',
    placeholder: 'you@example.com',
    type: 'email',
  },
];

function SettingsForm({ onLock }: { onLock: () => void }) {
  const [form, setForm] = useState<AppSettings>(getSettings());
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleSecret(key: string) {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    saveSettings(form);
    setSaving(false);
    showToast('Settings saved. Changes take effect immediately.');
  }

  function handleReset() {
    resetSettings();
    setForm(getSettings());
    showToast('Settings reset to environment variable defaults.');
  }

  function handleLock() {
    lockSession();
    onLock();
  }

  const hasMasterPassword = !!getMasterPassword();

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Settings"
        subtitle="Integration configuration"
        action={
          hasMasterPassword
            ? <Button variant="secondary" size="sm" icon={<Lock className="h-3.5 w-3.5" />} onClick={handleLock}>
                Lock
              </Button>
            : undefined
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">

          {/* Integration fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Integration Settings</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Saved to browser storage. Override the values baked in at build time.
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {FIELDS.map(field => {
                const isSecret = field.secret;
                const revealed = showSecrets[field.key];
                const value = form[field.key] as string;

                return (
                  <div key={field.key} className="px-5 py-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                    )}
                    <div className="relative">
                      <input
                        type={isSecret && !revealed ? 'password' : (field.type ?? 'text')}
                        value={value}
                        onChange={e => set(field.key, e.target.value as AppSettings[typeof field.key])}
                        placeholder={field.placeholder}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono pr-10"
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
                  </div>
                );
              })}

              {/* useMockData toggle */}
              <div className="px-5 py-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="useMockData"
                  checked={form.useMockData}
                  onChange={e => set('useMockData', e.target.checked)}
                  className="h-4 w-4 mt-0.5 text-blue-600 rounded"
                />
                <div>
                  <label htmlFor="useMockData" className="block text-sm font-medium text-gray-700">
                    Use mock data
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    When enabled, Google Sheets is not called and built-in sample data is used instead.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-gray-50 rounded-b-xl flex items-center gap-3">
              <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
                Save Settings
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={handleReset}
              >
                Reset to defaults
              </Button>
            </div>
          </div>

          {/* System info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-800">System Info</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: 'Search provider',   value: 'SerpAPI (via n8n)' },
                { label: 'Data mode',         value: form.useMockData ? 'Mock data' : 'Live Google Sheets' },
                { label: 'Password protected', value: hasMasterPassword ? 'Yes' : 'No (VITE_MASTER_SETTINGS_PASSWORD not set)' },
                { label: 'App version',        value: '0.1.0' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-gray-600">{row.label}</span>
                  <span className="text-sm font-medium text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function Settings() {
  const [unlocked, setUnlocked] = useState(isSessionUnlocked());

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return <SettingsForm onLock={() => setUnlocked(false)} />;
}
