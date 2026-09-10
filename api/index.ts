import express, { Request, Response } from 'express';
import { db } from '../server/store.ts';
import { lookupNumberInfo } from '../server/telecom.ts';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS header support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Normalize Vercel query rewrites & stripped prefixes
app.use((req, res, next) => {
  if (req.query && typeof req.query.match === 'string') {
    const matched = req.query.match;
    delete req.query.match;
    req.url = matched.startsWith('/') ? matched : '/api/' + matched;
  } else if (req.headers && req.headers['x-matched-path']) {
    const matched = req.headers['x-matched-path'] as string;
    if (matched.startsWith('/api') || matched.endsWith('.php')) {
      const qIdx = req.url.indexOf('?');
      req.url = matched + (qIdx !== -1 ? req.url.substring(qIdx) : '');
    }
  }

  // If path is stripped of /api
  if (req.url.startsWith('/admin') || req.url.startsWith('/number.php') || req.url === '/number' || req.url.startsWith('/number?')) {
    req.url = '/api' + req.url;
  }
  next();
});

const ADMIN_USER = process.env.ADMIN_USER || 'Abhi';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Abhi123';

// Public Telecom API Gateway
async function handleNumberApi(req: Request, res: Response) {
  const key = (typeof req.query.key === 'string' ? req.query.key.trim() : '') ||
              (typeof req.body?.key === 'string' ? req.body.key.trim() : '') ||
              (typeof req.headers['x-api-key'] === 'string' ? (req.headers['x-api-key'] as string).trim() : '');
  const num = (typeof req.query.num === 'string' ? req.query.num.trim() : '') ||
              (typeof req.body?.num === 'string' ? String(req.body.num).trim() : '') ||
              (typeof req.body?.number === 'string' ? String(req.body.number).trim() : '') ||
              (typeof req.body?.phone === 'string' ? String(req.body.phone).trim() : '');
  const debug = req.query.debug === '1' || req.query.debug === 'true' || req.body?.debug === true;

  if (!key) {
    return res.status(400).json({
      error: 'Missing API key',
      usage: '?key=YOUR_KEY&num=9876543210',
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }

  const keyRow = db.getKeyByText(key);

  if (!keyRow || keyRow.active !== 1 || keyRow.service_type !== 'number') {
    return res.status(401).json({
      error: 'Invalid API key',
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }

  if (keyRow.expiry_date) {
    const expiryTime = new Date(keyRow.expiry_date).getTime();
    if (!isNaN(expiryTime) && expiryTime < Date.now()) {
      const parts = keyRow.expiry_date.split('-');
      const formatted = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : keyRow.expiry_date;
      return res.status(403).json({
        error: `API Key expired on ${formatted}`,
        BUY_API: '@Vectraen',
        SUPPORT: '@Vectraen'
      });
    }
  }

  if (keyRow.daily_limit > 0 && keyRow.used_today >= keyRow.daily_limit) {
    return res.status(429).json({
      error: `Daily limit of ${keyRow.daily_limit} reached`,
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }

  if (!num) {
    return res.status(400).json({
      error: 'Missing num parameter',
      usage: '?key=YOUR_KEY&num=9876543210',
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }

  const cleanPhone = num.replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    return res.status(400).json({
      error: 'Invalid phone number! Need 10 digits.',
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }

  try {
    const result = await lookupNumberInfo(cleanPhone);
    db.recordUsage(keyRow, cleanPhone, 'success');

    if (debug) {
      return res.json({
        debug: {
          key: keyRow.key_text,
          used_today: keyRow.used_today,
          daily_limit: keyRow.daily_limit,
          parsed_phone: cleanPhone,
          timestamp: new Date().toISOString()
        },
        data: result,
        BUY_API: '@Vectraen',
        SUPPORT: '@Vectraen'
      });
    }

    return res.json({
      username: keyRow.key_text,
      type: 'number',
      data: result,
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Lookup failed';
    db.recordUsage(keyRow, cleanPhone, 'error', errorMessage);
    return res.status(500).json({
      error: 'Lookup failed: ' + errorMessage,
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }
}

// Routes for Public API
app.get('/api.php', handleNumberApi);
app.get('/api/number.php', handleNumberApi);
app.get('/api/number', handleNumberApi);
app.get('/api/lookup', handleNumberApi);
app.post('/api.php', handleNumberApi);
app.post('/api/number.php', handleNumberApi);
app.post('/api/number', handleNumberApi);
app.post('/api/lookup', handleNumberApi);

// Admin Routes
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const adminCreds = db.getAdmin();
  const validUser = (username === adminCreds.username || username === ADMIN_USER);
  const validPass = (password === adminCreds.password || password === ADMIN_PASS);

  if (validUser && validPass) {
    return res.json({
      success: true,
      token: 'admin_session_' + Date.now(),
      user: { username: adminCreds.username }
    });
  }
  return res.status(401).json({ success: false, error: 'Invalid credentials' });
});

app.post('/api/admin/change-credentials', (req: Request, res: Response) => {
  const { newUsername, newPassword } = req.body || {};
  if (!newUsername || !newPassword) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  db.setAdmin(newUsername, newPassword);
  res.json({ success: true, message: 'Admin credentials updated successfully!', username: newUsername });
});

app.get('/api/admin/stats', (req: Request, res: Response) => {
  const stats = db.getStats();
  res.json(stats);
});

app.get('/api/admin/keys', (req: Request, res: Response) => {
  const keys = db.getAllKeys();
  res.json(keys);
});

app.post('/api/admin/keys', (req: Request, res: Response) => {
  try {
    const { key_text, daily_limit, expiry_date } = req.body || {};
    if (!key_text || !String(key_text).trim()) {
      return res.status(400).json({ error: 'API Key Text is required' });
    }
    const result = db.createKey(String(key_text).trim(), Number(daily_limit) || 0, expiry_date ? String(expiry_date).trim() : '');
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to create key' });
    }
    return res.status(201).json({ success: true, key: result.key, message: 'API Key created successfully!' });
  } catch (err: unknown) {
    console.error('Error creating key:', err);
    const msg = err instanceof Error ? err.message : 'Server error creating key';
    return res.status(500).json({ error: msg });
  }
});

app.put('/api/admin/keys/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { daily_limit, expiry_date } = req.body || {};
  const ok = db.updateKey(id, Number(daily_limit) || 0, expiry_date || '');
  if (!ok) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ success: true, message: 'API Key updated successfully!' });
});

app.patch('/api/admin/keys/:id/toggle', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const ok = db.toggleKey(id);
  if (!ok) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ success: true, message: 'Key status updated!' });
});

app.delete('/api/admin/keys/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const ok = db.deleteKey(id);
  if (!ok) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ success: true, message: 'API Key deleted successfully!' });
});

app.get('/api/admin/logs', (req: Request, res: Response) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const logs = db.getLogs(limit);
  res.json(logs);
});

app.post('/api/admin/reset-daily', (req: Request, res: Response) => {
  db.resetDaily();
  res.json({ success: true, message: 'All daily counters reset to 0' });
});

app.post('/api/admin/test-lookup', async (req: Request, res: Response) => {
  const { phone, keyText } = req.body || {};
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Invalid phone number! Need 10 digits.' });
  }

  const keyRow = keyText ? db.getKeyByText(keyText) : db.getAllKeys()[0];
  if (!keyRow) {
    return res.status(400).json({ error: 'No active API key available. Please create one.' });
  }

  try {
    const data = await lookupNumberInfo(cleanPhone);
    db.recordUsage(keyRow, cleanPhone, 'success');
    return res.json({
      username: keyRow.key_text,
      type: 'number',
      data,
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lookup failed';
    return res.status(500).json({ error: msg });
  }
});

export { app };

export default function handler(req: any, res: any) {
  return app(req, res);
}
