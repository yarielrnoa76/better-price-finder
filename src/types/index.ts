export type ProductStatus = 'ACTIVE' | 'FOUND' | 'BEST_PROPOSAL' | 'PAUSED' | 'ERROR';
export type ResultType = 'DESIRED_MATCH' | 'BEST_PROPOSAL' | 'ABOVE_TARGET' | 'NOT_FOUND' | 'ERROR';
export type SearchStatus = 'SUCCESS' | 'ERROR' | 'PENDING';
export type SearchFrequency = 'manual' | 'daily' | '6h' | '12h';

export interface Product {
  ProductId: string;
  ProductName: string;
  AmazonASIN?: string;
  TargetPrice: number;
  SearchEnabled: boolean;
  Status: ProductStatus;
  LastSearchAt?: string;
  NextSearchAt?: string;
  LastPrice?: number;
  LastUrl?: string;
  LastResultTitle?: string;
  AlertSent: boolean;
  Notes?: string;
  SearchFrequency?: SearchFrequency;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ProcessHistory {
  RunId: string;
  ProductId: string;
  ProductName: string;
  SearchDate: string;
  SearchStatus: SearchStatus;
  ResultType: ResultType;
  AttemptNumber: number;
  Found: boolean;
  CurrentPrice?: number;
  TargetPrice: number;
  ResultTitle?: string;
  Url?: string;
  ErrorMessage?: string;
  Source?: string;
}

export interface PricesHistory {
  Date: string;
  ProductId: string;
  ProductName: string;
  Price: number;
  TargetPrice: number;
  Url?: string;
  ResultTitle?: string;
  BelowTarget: boolean;
}

export interface ProductFormData {
  ProductName: string;
  AmazonASIN?: string;
  TargetPrice: number;
  SearchEnabled: boolean;
  SearchFrequency: SearchFrequency;
  Notes?: string;
}

export interface N8nWebhookPayload {
  ProductId: string;
  ProductName: string;
  AmazonASIN?: string;
  TargetPrice: number;
  ManualRun: boolean;
}

export interface DashboardStats {
  totalActive: number;
  totalPaused: number;
  totalFound: number;
  totalAlertSent: number;
}
