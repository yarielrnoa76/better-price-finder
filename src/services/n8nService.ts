import axios from 'axios';
import type { N8nWebhookPayload } from '../types';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export type TriggerStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TriggerResult {
  status: TriggerStatus;
  message: string;
}

export async function triggerSearch(payload: N8nWebhookPayload): Promise<TriggerResult> {
  if (!WEBHOOK_URL) {
    console.warn('VITE_N8N_WEBHOOK_URL is not set — simulating webhook call');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { status: 'success', message: 'Search triggered (mock — no webhook URL configured)' };
  }

  try {
    await axios.post(WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    return { status: 'success', message: `Search triggered for "${payload.ProductName}"` };
  } catch (err) {
    let message: string;
    if (axios.isAxiosError(err) && !err.response) {
      message = 'Network error — verify that n8n has CORS enabled for this origin.';
    } else if (axios.isAxiosError(err)) {
      message = err.response?.data?.message ?? err.message;
    } else {
      message = 'Unknown error';
    }
    return { status: 'error', message };
  }
}
