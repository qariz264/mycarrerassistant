import app from '../server.js';

export default function handler(req: any, res: any) {
  if (req && req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      let pathname = parsedUrl.pathname;

      // In Vercel rewrites, destination "/api/index.ts" might pass the captured path in req.query['0']
      const queryParam = req.query?.['0'] || (req.query && Object.values(req.query)[0]);
      if (typeof queryParam === 'string' && queryParam && (pathname === '/api/index.ts' || pathname === '/api/index' || pathname === '/api' || pathname === '/api/')) {
        pathname = `/api/${queryParam.replace(/^\//, '')}`;
      } else if (!pathname.startsWith('/api') && !pathname.startsWith('/sitemap') && !pathname.startsWith('/robots')) {
        // If Vercel stripped the /api prefix (e.g. /paystack/initialize), ensure it matches Express routes
        pathname = `/api${pathname.startsWith('/') ? '' : '/'}${pathname}`;
      }

      req.url = `${pathname}${parsedUrl.search || ''}`;
    } catch (_) {}
  }
  return app(req, res);
}
