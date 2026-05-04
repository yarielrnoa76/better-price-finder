import axios from 'axios';
import type { Product, ProcessHistory, PricesHistory, ProductFormData } from '../types';
import { mockProducts, mockProcessHistory, mockPricesHistory } from '../mock/mockData';
import { getSettings } from './settingsService';

const sheetsBaseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

function useMock(): boolean {
  const { useMockData, googleApiKey } = getSettings();
  return useMockData || !googleApiKey;
}

function sheetUrl(sheetId: string, range: string): string {
  const { googleApiKey } = getSettings();
  return `${sheetsBaseUrl}/${sheetId}/values/${range}?key=${googleApiKey}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(headers: string[], row: any[]): Product {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
  return {
    ProductId:       obj.ProductId,
    ProductName:     obj.ProductName,
    AmazonASIN:      obj.AmazonASIN || undefined,
    TargetPrice:     parseFloat(obj.TargetPrice) || 0,
    SearchEnabled:   obj.SearchEnabled === 'TRUE' || obj.SearchEnabled === 'true',
    Status:          (obj.Status as Product['Status']) || 'ACTIVE',
    LastSearchAt:    obj.LastSearchAt || undefined,
    NextSearchAt:    obj.NextSearchAt || undefined,
    LastPrice:       obj.LastPrice ? parseFloat(obj.LastPrice) : undefined,
    LastUrl:         obj.LastUrl || undefined,
    LastResultTitle: obj.LastResultTitle || undefined,
    AlertSent:       obj.AlertSent === 'TRUE' || obj.AlertSent === 'true',
    Notes:           obj.Notes || undefined,
    CreatedAt:       obj.CreatedAt,
    UpdatedAt:       obj.UpdatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProcessHistory(headers: string[], row: any[]): ProcessHistory {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
  return {
    RunId:          obj.RunId,
    ProductId:      obj.ProductId,
    ProductName:    obj.ProductName,
    SearchDate:     obj.SearchDate,
    SearchStatus:   (obj.SearchStatus as ProcessHistory['SearchStatus']) || 'PENDING',
    ResultType:     (obj.ResultType as ProcessHistory['ResultType']) || 'NOT_FOUND',
    AttemptNumber:  parseInt(obj.AttemptNumber) || 1,
    Found:          obj.Found === 'TRUE' || obj.Found === 'true',
    CurrentPrice:   obj.CurrentPrice ? parseFloat(obj.CurrentPrice) : undefined,
    TargetPrice:    parseFloat(obj.TargetPrice) || 0,
    ResultTitle:    obj.ResultTitle || undefined,
    Url:            obj.Url || undefined,
    ErrorMessage:   obj.ErrorMessage || undefined,
    Source:         obj.Source || undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPricesHistory(headers: string[], row: any[]): PricesHistory {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
  return {
    Date:        obj.Date,
    ProductId:   obj.ProductId,
    ProductName: obj.ProductName,
    Price:       parseFloat(obj.Price) || 0,
    TargetPrice: parseFloat(obj.TargetPrice) || 0,
    Url:         obj.Url || undefined,
    ResultTitle: obj.ResultTitle || undefined,
    BelowTarget: obj.BelowTarget === 'TRUE' || obj.BelowTarget === 'true',
  };
}

export async function getProducts(): Promise<Product[]> {
  if (useMock()) {
    await delay(300);
    return [...mockProducts];
  }
  const { productsSheetId } = getSettings();
  const res = await axios.get(sheetUrl(productsSheetId, 'Products!A1:P'));
  const [headers, ...rows] = res.data.values as string[][];
  return rows.map((row) => rowToProduct(headers, row));
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  if (useMock()) {
    await delay(400);
    const now = new Date().toISOString();
    const newProduct: Product = {
      ProductId:     `P-${String(mockProducts.length + 1).padStart(3, '0')}`,
      ProductName:   data.ProductName,
      AmazonASIN:    data.AmazonASIN,
      TargetPrice:   data.TargetPrice,
      SearchEnabled: data.SearchEnabled,
      Status:        'ACTIVE',
      AlertSent:     false,
      Notes:         data.Notes,
      SearchFrequency: data.SearchFrequency,
      CreatedAt:     now,
      UpdatedAt:     now,
    };
    mockProducts.push(newProduct);
    return newProduct;
  }
  const { productsSheetId, googleApiKey } = getSettings();
  const now = new Date().toISOString();
  const row = [
    `P-${Date.now()}`, data.ProductName, data.AmazonASIN ?? '', data.TargetPrice,
    data.SearchEnabled ? 'TRUE' : 'FALSE', 'ACTIVE', '', '', '', '', '', 'FALSE',
    data.Notes ?? '', now, now,
  ];
  await axios.post(
    `${sheetsBaseUrl}/${productsSheetId}/values/Products!A1:append?valueInputOption=USER_ENTERED&key=${googleApiKey}`,
    { values: [row] }
  );
  return getProducts().then(products => products[products.length - 1]);
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
  if (useMock()) {
    await delay(300);
    const idx = mockProducts.findIndex(p => p.ProductId === productId);
    if (idx !== -1) {
      mockProducts[idx] = { ...mockProducts[idx], ...data, UpdatedAt: new Date().toISOString() };
    }
    return;
  }
  console.warn('updateProduct real implementation requires row lookup', productId, data);
}

export async function getProcessHistory(productId?: string): Promise<ProcessHistory[]> {
  if (useMock()) {
    await delay(300);
    const history = [...mockProcessHistory].sort(
      (a, b) => new Date(b.SearchDate).getTime() - new Date(a.SearchDate).getTime()
    );
    return productId ? history.filter(h => h.ProductId === productId) : history;
  }
  const { processHistorySheetId } = getSettings();
  const res = await axios.get(sheetUrl(processHistorySheetId, 'ProcessHistory!A1:N'));
  const [headers, ...rows] = res.data.values as string[][];
  const history = rows.map((row) => rowToProcessHistory(headers, row));
  return productId ? history.filter(h => h.ProductId === productId) : history;
}

export async function getPricesHistory(productId?: string): Promise<PricesHistory[]> {
  if (useMock()) {
    await delay(300);
    const history = [...mockPricesHistory].sort(
      (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()
    );
    return productId ? history.filter(h => h.ProductId === productId) : history;
  }
  const { pricesHistorySheetId } = getSettings();
  const res = await axios.get(sheetUrl(pricesHistorySheetId, 'PricesHistory!A1:H'));
  const [headers, ...rows] = res.data.values as string[][];
  const history = rows.map((row) => rowToPricesHistory(headers, row));
  return productId ? history.filter(h => h.ProductId === productId) : history;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
