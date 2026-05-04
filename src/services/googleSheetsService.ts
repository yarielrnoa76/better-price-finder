import axios from 'axios';
import type { Product, ProcessHistory, PricesHistory, ProductFormData } from '../types';
import { mockProducts, mockProcessHistory, mockPricesHistory } from '../mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const PRODUCTS_SHEET_ID = import.meta.env.VITE_GOOGLE_PRODUCTS_SHEET_ID;
const PROCESS_HISTORY_SHEET_ID = import.meta.env.VITE_GOOGLE_PROCESS_HISTORY_SHEET_ID;
const PRICES_HISTORY_SHEET_ID = import.meta.env.VITE_GOOGLE_PRICES_HISTORY_SHEET_ID;

const sheetsBaseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

function sheetUrl(sheetId: string, range: string) {
  return `${sheetsBaseUrl}/${sheetId}/values/${range}?key=${API_KEY}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(headers: string[], row: any[]): Product {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
  return {
    ProductId: obj.ProductId,
    ProductName: obj.ProductName,
    AmazonASIN: obj.AmazonASIN || undefined,
    TargetPrice: parseFloat(obj.TargetPrice) || 0,
    SearchEnabled: obj.SearchEnabled === 'TRUE' || obj.SearchEnabled === 'true',
    Status: (obj.Status as Product['Status']) || 'ACTIVE',
    LastSearchAt: obj.LastSearchAt || undefined,
    NextSearchAt: obj.NextSearchAt || undefined,
    LastPrice: obj.LastPrice ? parseFloat(obj.LastPrice) : undefined,
    LastUrl: obj.LastUrl || undefined,
    LastResultTitle: obj.LastResultTitle || undefined,
    AlertSent: obj.AlertSent === 'TRUE' || obj.AlertSent === 'true',
    Notes: obj.Notes || undefined,
    CreatedAt: obj.CreatedAt,
    UpdatedAt: obj.UpdatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProcessHistory(headers: string[], row: any[]): ProcessHistory {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
  return {
    RunId: obj.RunId,
    ProductId: obj.ProductId,
    ProductName: obj.ProductName,
    SearchDate: obj.SearchDate,
    SearchStatus: (obj.SearchStatus as ProcessHistory['SearchStatus']) || 'PENDING',
    ResultType: (obj.ResultType as ProcessHistory['ResultType']) || 'NOT_FOUND',
    AttemptNumber: parseInt(obj.AttemptNumber) || 1,
    Found: obj.Found === 'TRUE' || obj.Found === 'true',
    CurrentPrice: obj.CurrentPrice ? parseFloat(obj.CurrentPrice) : undefined,
    TargetPrice: parseFloat(obj.TargetPrice) || 0,
    ResultTitle: obj.ResultTitle || undefined,
    Url: obj.Url || undefined,
    ErrorMessage: obj.ErrorMessage || undefined,
    Source: obj.Source || undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPricesHistory(headers: string[], row: any[]): PricesHistory {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
  return {
    Date: obj.Date,
    ProductId: obj.ProductId,
    ProductName: obj.ProductName,
    Price: parseFloat(obj.Price) || 0,
    TargetPrice: parseFloat(obj.TargetPrice) || 0,
    Url: obj.Url || undefined,
    ResultTitle: obj.ResultTitle || undefined,
    BelowTarget: obj.BelowTarget === 'TRUE' || obj.BelowTarget === 'true',
  };
}

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await delay(300);
    return [...mockProducts];
  }
  const res = await axios.get(sheetUrl(PRODUCTS_SHEET_ID, 'Products!A1:P'));
  const [headers, ...rows] = res.data.values as string[][];
  return rows.map((row) => rowToProduct(headers, row));
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  if (USE_MOCK) {
    await delay(400);
    const now = new Date().toISOString();
    const newProduct: Product = {
      ProductId: `P-${String(mockProducts.length + 1).padStart(3, '0')}`,
      ProductName: data.ProductName,
      AmazonASIN: data.AmazonASIN,
      TargetPrice: data.TargetPrice,
      SearchEnabled: data.SearchEnabled,
      Status: 'ACTIVE',
      AlertSent: false,
      Notes: data.Notes,
      SearchFrequency: data.SearchFrequency,
      CreatedAt: now,
      UpdatedAt: now,
    };
    mockProducts.push(newProduct);
    return newProduct;
  }
  const now = new Date().toISOString();
  const row = [
    `P-${Date.now()}`, data.ProductName, data.AmazonASIN ?? '', data.TargetPrice,
    data.SearchEnabled ? 'TRUE' : 'FALSE', 'ACTIVE', '', '', '', '', '', 'FALSE',
    data.Notes ?? '', now, now,
  ];
  await axios.post(
    `${sheetsBaseUrl}/${PRODUCTS_SHEET_ID}/values/Products!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
    { values: [row] }
  );
  return getProducts().then(products => products[products.length - 1]);
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    const idx = mockProducts.findIndex(p => p.ProductId === productId);
    if (idx !== -1) {
      mockProducts[idx] = { ...mockProducts[idx], ...data, UpdatedAt: new Date().toISOString() };
    }
    return;
  }
  // In real impl: find row index, then update specific cells
  console.warn('updateProduct real implementation requires row lookup', productId, data);
}

export async function getProcessHistory(productId?: string): Promise<ProcessHistory[]> {
  if (USE_MOCK) {
    await delay(300);
    const history = [...mockProcessHistory].sort(
      (a, b) => new Date(b.SearchDate).getTime() - new Date(a.SearchDate).getTime()
    );
    return productId ? history.filter(h => h.ProductId === productId) : history;
  }
  const res = await axios.get(sheetUrl(PROCESS_HISTORY_SHEET_ID, 'ProcessHistory!A1:N'));
  const [headers, ...rows] = res.data.values as string[][];
  const history = rows.map((row) => rowToProcessHistory(headers, row));
  return productId ? history.filter(h => h.ProductId === productId) : history;
}

export async function getPricesHistory(productId?: string): Promise<PricesHistory[]> {
  if (USE_MOCK) {
    await delay(300);
    const history = [...mockPricesHistory].sort(
      (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()
    );
    return productId ? history.filter(h => h.ProductId === productId) : history;
  }
  const res = await axios.get(sheetUrl(PRICES_HISTORY_SHEET_ID, 'PricesHistory!A1:H'));
  const [headers, ...rows] = res.data.values as string[][];
  const history = rows.map((row) => rowToPricesHistory(headers, row));
  return productId ? history.filter(h => h.ProductId === productId) : history;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
