/**
 * Vercel Serverless Function: GET /api/paystack/config
 * Exposes public key and configuration status - 100% self-contained
 */

function cleanKey(val?: string): string {
  if (!val) return '';
  let str = String(val).trim();
  str = str.replace(/^["'`]|["'`]$/g, '').trim();
  str = str.replace(/[;,]$/, '').trim();
  str = str.replace(/[\r\n\t]/g, '').trim();
  return str;
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

function getPaystackKeys() {
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

  if (!rawSecret) {
    for (const [key, val] of Object.entries(process.env)) {
      if (!val) continue;
      const upper = key.toUpperCase();
      const cleaned = cleanKey(val);
      if (cleaned.startsWith('sk_test_') || cleaned.startsWith('sk_live_')) {
        rawSecret = cleaned;
        break;
      }
      if (
        upper.includes('PAYSTACK') && 
        (upper.includes('SECRET') || upper.includes('PRIVATE') || upper.includes('SEC_KEY') || upper.includes('_SK'))
      ) {
        rawSecret = cleaned;
        break;
      }
    }
  }

  if (!rawPublic) {
    for (const [key, val] of Object.entries(process.env)) {
      if (!val) continue;
      const upper = key.toUpperCase();
      const cleaned = cleanKey(val);
      if (cleaned.startsWith('pk_test_') || cleaned.startsWith('pk_live_')) {
        rawPublic = cleaned;
        break;
      }
      if (
        upper.includes('PAYSTACK') && 
        (upper.includes('PUBLIC') || upper.includes('PUB_KEY') || upper.includes('_PK'))
      ) {
        rawPublic = cleaned;
        break;
      }
    }
  }

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

  return {
    publicKey: rawPublic,
    secretKey: rawSecret,
    isConfigured: hasRealPublic || hasRealSecret,
    isTest: rawPublic.startsWith('pk_test_') || rawSecret.startsWith('sk_test_'),
    isLive: rawPublic.startsWith('pk_live_') || rawSecret.startsWith('sk_live_'),
  };
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

  const keys = getPaystackKeys();
  const maskSecret = (key: string) => {
    if (!key || key.length < 12) return 'sk_••••••••';
    return `${key.slice(0, 7)}••••••••${key.slice(-4)}`;
  };

  return sendJson(res, 200, {
    publicKey: keys.publicKey,
    maskedSecretKey: maskSecret(keys.secretKey),
    isConfigured: keys.isConfigured,
    isTest: keys.isTest,
    isLive: keys.isLive,
    amountKsh: 100,
  });
}
