import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/store.ts';
import { lookupNumberInfo } from './server/telecom.ts';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional CORS header support for external API callers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Normalize Vercel / serverless routing and rewrite parameters
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

  // Handle stripped /api prefixes on Vercel
  if (req.url.startsWith('/admin') || req.url.startsWith('/number.php') || req.url.startsWith('/number?') || req.url === '/number') {
    req.url = '/api' + req.url;
  }
  next();
});

// Admin credentials
const ADMIN_USER = process.env.ADMIN_USER || 'Abhi';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Abhi123';

// ==========================================
// PUBLIC API GATEWAY (Faithful to api.php)
// Handles: /api.php, /api/number.php, /api/number, /api/lookup
// ==========================================
async function handleNumberApi(req: Request, res: Response) {
  const key = typeof req.query.key === 'string' ? req.query.key.trim() : '';
  const num = typeof req.query.num === 'string' ? req.query.num.trim() : '';
  const debug = req.query.debug === '1' || req.query.debug === 'true';

  if (!key) {
    return res.status(400).json({
      error: 'Missing API key',
      usage: '?key=YOUR_KEY&num=9876543210',
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }

  // Validate API key in database
  const keyRow = db.getKeyByText(key);

  if (!keyRow || keyRow.active !== 1 || keyRow.service_type !== 'number') {
    return res.status(401).json({
      error: 'Invalid API key',
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }

  // Expiry check
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

  // Daily limit check
  if (keyRow.daily_limit > 0 && keyRow.used_today >= keyRow.daily_limit) {
    return res.status(429).json({
      error: `Daily limit of ${keyRow.daily_limit} reached`,
      BUY_API: '@Vectraen',
      SUPPORT: '@Vectraen'
    });
  }

  // Phone number parameter check
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

    // Record usage log
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

// Register API routes for compatibility with PHP URLs and REST URLs
app.get('/api.php', handleNumberApi);
app.get('/api/number.php', handleNumberApi);
app.get('/api/number', handleNumberApi);
app.get('/api/lookup', handleNumberApi);

// ==========================================
// ADMIN DASHBOARD API (Faithful to anish.php)
// ==========================================

// Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const adminCreds = db.getAdmin();
  const validUser = (username === adminCreds.username || username === ADMIN_USER);
  const validPass = (password === adminCreds.password || password === ADMIN_PASS);

  if (validUser && validPass) {
    // Return token
    return res.json({
      success: true,
      token: 'admin_session_' + Date.now(),
      user: { username: adminCreds.username }
    });
  }
  return res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// Change Credentials
app.post('/api/admin/change-credentials', (req: Request, res: Response) => {
  const { newUsername, newPassword } = req.body;
  if (!newUsername || !newPassword) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  db.setAdmin(newUsername, newPassword);
  res.json({ success: true, message: 'Admin credentials updated successfully!', username: newUsername });
});

// Stats
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const stats = db.getStats();
  res.json(stats);
});

// Keys list
app.get('/api/admin/keys', (req: Request, res: Response) => {
  const keys = db.getAllKeys();
  res.json(keys);
});

// Create Key
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

// Edit Key
app.put('/api/admin/keys/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { daily_limit, expiry_date } = req.body;
  const ok = db.updateKey(id, Number(daily_limit) || 0, expiry_date || '');
  if (!ok) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ success: true, message: 'API Key updated successfully!' });
});

// Toggle Key Active / Revoked
app.patch('/api/admin/keys/:id/toggle', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const ok = db.toggleKey(id);
  if (!ok) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ success: true, message: 'Key status updated!' });
});

// Delete Key
app.delete('/api/admin/keys/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const ok = db.deleteKey(id);
  if (!ok) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ success: true, message: 'Key deleted successfully!' });
});

// Reset Daily Usage
app.post('/api/admin/reset-daily', (req: Request, res: Response) => {
  db.resetDaily();
  res.json({ success: true, message: 'Daily usage reset successfully!' });
});

// Usage Logs
app.get('/api/admin/logs', (req: Request, res: Response) => {
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const logs = db.getLogs(limit);
  res.json(logs);
});

// Admin Test Lookup
app.post('/api/admin/test-lookup', async (req: Request, res: Response) => {
  const { phone, keyText } = req.body;
  const cleanPhone = (phone || '').replace(/\D/g, '');
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

// ==========================================
// VITE MIDDLEWARE & SERVER BOOT
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Number Info API Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
