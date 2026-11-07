/**
 * Vercel Serverless Function: GET /api/config
 * 100% self-contained with zero external file dependencies
 */

function cleanKey(val?: string): string {
  if (!val) return '';
  let str = String(val).trim();
  str = str.replace(/^["'`]|["'`]$/g, '').trim();
  str = str.replace(/[;,]$/, '').trim();
  str = str.replace(/[\r\n\t]/g, '').trim();
  return str;
}

function isUsablePublicKey(key?: string): boolean {
  if (!key) return false;
  const k = cleanKey(key);
  if (k.length < 15) return false;
  if (
    k.includes('YOUR_PAYSTACK') ||
    k.includes('xxxx') ||
    k.includes('sample') ||
    k.includes('demo') ||
    k.includes('pending') ||
    k.includes('••••')
  ) {
    return false;
  }
  return k.startsWith('pk_');
}

function isUsableSecretKey(key?: string): boolean {
  if (!key) return false;
  const k = cleanKey(key);
  if (k.length < 15) return false;
  if (
    k.includes('YOUR_PAYSTACK') ||
    k.includes('xxxx') ||
    k.includes('sample') ||
    k.includes('demo') ||
    k.includes('pending') ||
    k.includes('••••')
  ) {
    return false;
  }
  return k.startsWith('sk_');
}

function sendJson(res: any, status: number, data: any) {
  if (res.headersSent) return;
  res.setHeader('Content-Type', 'application/json');
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(status).json(data);
    return;
  }
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  let rawPublic = cleanKey(
    process.env.PAYSTACK_PUBLIC_KEY || 
    process.env.paystack_public_key || 
    process.env.VITE_PAYSTACK_PUBLIC_KEY || 
    process.env.vite_paystack_public_key || 
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
    process.env.PAYSTACK_PUBLIC ||
    process.env.PAYSTACK_KEY
  );
  let rawSecret = cleanKey(
    process.env.PAYSTACK_SECRET_KEY || 
    process.env.paystack_secret_key || 
    process.env.PAYSTACK_SECRET || 
    process.env.paystack_secret || 
    process.env.PAYSTACK_PRIVATE_KEY ||
    process.env.VITE_PAYSTACK_SECRET_KEY
  );

  // Auto-detect and fix accidental key inversion in Vercel UI
  if (rawPublic.startsWith('sk_') && !rawSecret.startsWith('sk_')) {
    const temp = rawPublic;
    rawPublic = rawSecret.startsWith('pk_') ? rawSecret : '';
    rawSecret = temp;
  } else if (rawSecret.startsWith('pk_') && !rawPublic.startsWith('pk_')) {
    const temp = rawSecret;
    rawSecret = rawPublic.startsWith('sk_') ? rawPublic : '';
    rawPublic = temp;
  }

  const hasRealPublic = isUsablePublicKey(rawPublic);
  const hasRealSecret = isUsableSecretKey(rawSecret);

  return sendJson(res, 200, {
    paystackPublicKey: rawPublic,
    amountKsh: 100,
    isConfigured: hasRealPublic || hasRealSecret,
    isTest: rawPublic.startsWith('pk_test_') || rawSecret.startsWith('sk_test_'),
    isLive: rawPublic.startsWith('pk_live_') || rawSecret.startsWith('sk_live_'),
  });
}
