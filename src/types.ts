export interface ApiKey {
  id: number;
  key_text: string;
  service_type: string;
  daily_limit: number;
  used_today: number;
  total_used: number;
  last_used: string;
  expiry_date: string;
  created_at: string;
  active: number; // 1 or 0
}

export interface UsageLog {
  id: number;
  api_key_id: number;
  key_text: string;
  query: string;
  used_at: string;
  status: 'success' | 'error';
  details?: string;
}

export interface DashboardStats {
  totalKeys: number;
  todayUsage: number;
  totalUsage: number;
  activeKeys: number;
}

export interface TelecomData {
  number: string;
  valid: boolean;
  carrier: string;
  circle: string;
  region: string;
  line_type: string;
  series: string;
  mcc: string;
  mnc: string;
  country: string;
  country_code: string;
  timezone?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ApiResponse {
  username?: string;
  type?: string;
  data?: TelecomData;
  BUY_API?: string;
  SUPPORT?: string;
  error?: string;
  usage?: string;
}
