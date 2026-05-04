export interface AppSettings {
  webhookUrl: string;
  googleApiKey: string;
  productsSheetId: string;
  processHistorySheetId: string;
  pricesHistorySheetId: string;
  defaultEmail: string;
  useMockData: boolean;
}

const STORAGE_KEY = 'bpf_settings';
const SESSION_KEY = 'bpf_settings_unlocked';

function envDefaults(): AppSettings {
  return {
    webhookUrl:             import.meta.env.VITE_N8N_WEBHOOK_URL ?? '',
    googleApiKey:           import.meta.env.VITE_GOOGLE_SHEETS_API_KEY ?? '',
    productsSheetId:        import.meta.env.VITE_GOOGLE_PRODUCTS_SHEET_ID ?? '',
    processHistorySheetId:  import.meta.env.VITE_GOOGLE_PROCESS_HISTORY_SHEET_ID ?? '',
    pricesHistorySheetId:   import.meta.env.VITE_GOOGLE_PRICES_HISTORY_SHEET_ID ?? '',
    defaultEmail:           import.meta.env.VITE_DEFAULT_ALERT_EMAIL ?? '',
    useMockData:            import.meta.env.VITE_USE_MOCK_DATA === 'true',
  };
}

export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...envDefaults(), ...JSON.parse(stored) };
  } catch { /* fall through */ }
  return envDefaults();
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getMasterPassword(): string {
  return import.meta.env.VITE_MASTER_SETTINGS_PASSWORD ?? '';
}

export function isSessionUnlocked(): boolean {
  const master = getMasterPassword();
  if (!master) return true; // no password configured → always open
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function unlockSession(): void {
  sessionStorage.setItem(SESSION_KEY, 'true');
}

export function lockSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
