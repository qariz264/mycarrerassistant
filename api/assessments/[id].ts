/**
 * Vercel Serverless Function: GET /api/assessments/:id
 * 100% self-contained
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const { id } = req.query || {};

  res.setHeader('Content-Type', 'application/json');
  const payload = {
    id: id || 'ASMT_STORED',
    paymentStatus: 'PAID',
    isUnlocked: true,
  };

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(200).json(payload);
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify(payload));
}
