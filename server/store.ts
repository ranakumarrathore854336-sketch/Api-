import fs from 'fs';
import path from 'path';
import os from 'os';

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

interface DatabaseSchema {
  keys: ApiKey[];
  logs: UsageLog[];
  lastResetDate: string;
  admin?: {
    username: string;
    password: string;
  };
}

// Serverless / Vercel detection: local filesystem is read-only except /tmp
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_SERVERLESS
  ? path.resolve(os.tmpdir(), 'telecom_data')
  : path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'api_store.json');
const SEED_FILE = path.resolve(process.cwd(), 'data', 'api_store.json');

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

const initialData: DatabaseSchema = {
  admin: {
    username: process.env.ADMIN_USER || 'Abhi',
    password: process.env.ADMIN_PASS || 'Abhi123'
  },
  keys: [
    {
      id: 1,
      key_text: 'abhi_master_key',
      service_type: 'number',
      daily_limit: 500,
      used_today: 12,
      total_used: 184,
      last_used: new Date().toISOString(),
      expiry_date: '',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      active: 1
    },
    {
      id: 2,
      key_text: 'demo_user_test',
      service_type: 'number',
      daily_limit: 50,
      used_today: 4,
      total_used: 48,
      last_used: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      active: 1
    },
    {
      id: 3,
      key_text: 'sample_trial_99',
      service_type: 'number',
      daily_limit: 100,
      used_today: 0,
      total_used: 12,
      last_used: '',
      expiry_date: '',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      active: 1
    }
  ],
  logs: [
    {
      id: 1,
      api_key_id: 1,
      key_text: 'anish_master_key',
      query: '9876543210',
      used_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'success'
    },
    {
      id: 2,
      api_key_id: 1,
      key_text: 'anish_master_key',
      query: '9810123456',
      used_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      status: 'success'
    },
    {
      id: 3,
      api_key_id: 2,
      key_text: 'demo_user_test',
      query: '7000123456',
      used_at: new Date(Date.now() - 1800000).toISOString(),
      status: 'success'
    }
  ],
  lastResetDate: getTodayString()
};

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.data = initialData;
    this.load();
    this.checkDailyAutoReset();
  }

  private load() {
    try {
      // In serverless / Vercel: DB_FILE is in /tmp. If not present yet, copy from bundled seed
      if (!fs.existsSync(DB_FILE)) {
        if (fs.existsSync(SEED_FILE)) {
          try {
            const rawSeed = fs.readFileSync(SEED_FILE, 'utf-8');
            this.data = JSON.parse(rawSeed);
          } catch (seedErr) {
            console.warn('Could not read seed file, using defaults:', seedErr);
          }
        }
      } else {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      }

      if (!this.data.admin) {
        this.data.admin = {
          username: process.env.ADMIN_USER || 'Abhi',
          password: process.env.ADMIN_PASS || 'Abhi123'
        };
      }
      this.save();
    } catch (err) {
      console.warn('Notice: Using in-memory database store:', err);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      // Gracefully handle read-only systems without breaking in-memory state
      console.warn('Notice: Saved to in-memory state (disk sync skipped):', err);
    }
  }

  private checkDailyAutoReset() {
    const today = getTodayString();
    if (this.data.lastResetDate !== today) {
      this.data.keys.forEach(k => {
        k.used_today = 0;
      });
      this.data.lastResetDate = today;
      this.save();
    }
  }

  public getAllKeys(): ApiKey[] {
    this.checkDailyAutoReset();
    return [...this.data.keys].sort((a, b) => b.id - a.id);
  }

  public getKeyById(id: number): ApiKey | undefined {
    this.checkDailyAutoReset();
    return this.data.keys.find(k => k.id === id);
  }

  public getKeyByText(keyText: string): ApiKey | undefined {
    this.checkDailyAutoReset();
    return this.data.keys.find(k => k.key_text.trim() === keyText.trim());
  }

  public createKey(keyText: string, dailyLimit: number, expiryDate: string): { success: boolean; error?: string; key?: ApiKey } {
    try {
      this.checkDailyAutoReset();
      const cleanText = keyText.trim();
      if (!cleanText) {
        return { success: false, error: 'API key text is required' };
      }
      if (this.data.keys.some(k => k.key_text.toLowerCase() === cleanText.toLowerCase())) {
        return { success: false, error: 'API key already exists' };
      }

      const nextId = this.data.keys.length > 0 ? Math.max(...this.data.keys.map(k => k.id)) + 1 : 1;
      const newKey: ApiKey = {
        id: nextId,
        key_text: cleanText,
        service_type: 'number',
        daily_limit: Math.max(0, dailyLimit),
        used_today: 0,
        total_used: 0,
        last_used: '',
        expiry_date: expiryDate.trim(),
        created_at: new Date().toISOString(),
        active: 1
      };

      this.data.keys.push(newKey);
      this.save();
      return { success: true, key: newKey };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating key';
      return { success: false, error: msg };
    }
  }

  public updateKey(id: number, dailyLimit: number, expiryDate: string): boolean {
    const key = this.data.keys.find(k => k.id === id);
    if (!key) return false;
    key.daily_limit = Math.max(0, dailyLimit);
    key.expiry_date = expiryDate.trim();
    this.save();
    return true;
  }

  public toggleKey(id: number): boolean {
    const key = this.data.keys.find(k => k.id === id);
    if (!key) return false;
    key.active = key.active ? 0 : 1;
    this.save();
    return true;
  }

  public deleteKey(id: number): boolean {
    const initialLen = this.data.keys.length;
    this.data.keys = this.data.keys.filter(k => k.id !== id);
    this.data.logs = this.data.logs.filter(l => l.api_key_id !== id);
    this.save();
    return this.data.keys.length < initialLen;
  }

  public resetDaily(): void {
    this.data.keys.forEach(k => {
      k.used_today = 0;
    });
    this.data.lastResetDate = getTodayString();
    this.save();
  }

  public recordUsage(key: ApiKey, query: string, status: 'success' | 'error', details?: string): void {
    this.checkDailyAutoReset();
    const existing = this.data.keys.find(k => k.id === key.id);
    if (existing) {
      existing.used_today += 1;
      existing.total_used += 1;
      existing.last_used = new Date().toISOString();
    }

    const nextLogId = this.data.logs.length > 0 ? Math.max(...this.data.logs.map(l => l.id)) + 1 : 1;
    this.data.logs.unshift({
      id: nextLogId,
      api_key_id: key.id,
      key_text: key.key_text,
      query,
      used_at: new Date().toISOString(),
      status,
      details
    });

    // Keep last 1000 logs
    if (this.data.logs.length > 1000) {
      this.data.logs = this.data.logs.slice(0, 1000);
    }

    this.save();
  }

  public getLogs(limit = 50): UsageLog[] {
    return this.data.logs.slice(0, limit);
  }

  public getStats() {
    this.checkDailyAutoReset();
    const today = getTodayString();
    const totalKeys = this.data.keys.length;
    const activeKeys = this.data.keys.filter(k => k.active === 1).length;
    
    // Total today across all keys or logs today
    const todayUsage = this.data.logs.filter(l => l.used_at.startsWith(today)).length;
    const totalUsage = this.data.logs.length;

    return {
      totalKeys,
      todayUsage,
      totalUsage,
      activeKeys
    };
  }

  public getAdmin(): { username: string; password: string } {
    return {
      username: this.data.admin?.username || process.env.ADMIN_USER || 'Abhi',
      password: this.data.admin?.password || process.env.ADMIN_PASS || 'Abhi123'
    };
  }

  public setAdmin(username: string, password: string): void {
    this.data.admin = {
      username: username.trim(),
      password: password.trim()
    };
    this.save();
  }
}

export const db = new Store();
