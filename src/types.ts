export interface Product {
  id: string;
  sku: string;
  name: string;
  bling_stock: number;
  ml_stock: number;
  shopee_stock: number | null;
  ml_status: string;
  shopee_status: string | null;
  price: number;
  has_photo: boolean;
  has_description: boolean;
  has_video: boolean;
  title_valid: boolean;
  attributes_complete: boolean;
  image_url: string;
  ignored_alert?: boolean;
}

export interface Order {
  id: string;
  marketplace: 'mercadolivre' | 'shopee' | 'bling';
  customer: string;
  status: 'paid' | 'new' | 'invoice_pending' | 'delivered' | 'stopped' | 'picking' | 'shipped';
  date: string;
  total: number;
  items_count: number;
  tracking_code: string | null;
}

export interface APIStatus {
  id: 'bling' | 'mercadolivre' | 'shopee';
  name: string;
  status: 'active' | 'warning' | 'error';
  latency: number;
  uptime: number;
  token_expires: string;
  requests_today: number;
  requests_limit: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details: string | null;
  payload?: string; // JSON string payload for deep inspection
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  marketplace: 'mercadolivre' | 'shopee' | 'bling' | 'all';
}

export interface SystemConfig {
  bling_token: string;
  ml_client_id: string;
  ml_client_secret: string;
  ml_access_token: string;
  shopee_partner_id: string;
  shopee_partner_key: string;
  shopee_shop_id: string;
  shopee_access_token: string;
}
