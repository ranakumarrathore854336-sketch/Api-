import { app } from '../server.ts';

export default function handler(req: any, res: any) {
  // Normalize Vercel query rewrites (e.g. ?match=admin/keys)
  if (req.query && typeof req.query.match === 'string') {
    const match = req.query.match;
    delete req.query.match;
    req.url = match.startsWith('/') ? match : '/api/' + match;
  } else if (req.headers && req.headers['x-matched-path']) {
    const matched = req.headers['x-matched-path'] as string;
    if (matched.startsWith('/api') || matched.endsWith('.php')) {
      const qIdx = req.url.indexOf('?');
      req.url = matched + (qIdx !== -1 ? req.url.substring(qIdx) : '');
    }
  }

  // Ensure /api prefix if missing
  if (req.url && (req.url.startsWith('/admin') || req.url.startsWith('/number.php') || req.url === '/number' || req.url.startsWith('/number?'))) {
    req.url = '/api' + req.url;
  }

  return app(req, res);
}

