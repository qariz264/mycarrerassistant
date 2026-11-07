/**
 * Shared Paystack utility functions for Career Assistant KE
 * Used across Vercel Serverless Functions and standalone Express server
 */

export interface PaystackKeysInfo {
  publicKey: string;
  secretKey: string;
  source: 'env' | 'demo';
  isConfigured: boolean;
  isTest: boolean;
  isLive: boolean;
}

export function cleanKey(val?: string): string {
  if (!val) return '';
  let str = String(val).trim();
  // Strip surrounding quotes
  str = str.replace(/^["'`]|["'`]$/g, '').trim();
  // Strip trailing semicolon or comma
  str = str.replace(/[;,]$/, '').trim();
  // Strip carriage returns, newlines, and tabs
  str = str.replace(/[\r\n\t]/g, '').trim();
  return str;
}

export function isUsableSecretKey(key?: string): boolean {
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

export function isUsablePublicKey(key?: string): boolean {
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

export function getPaystackKeys(): PaystackKeysInfo {
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

  // Scan all process.env variables to auto-detect any Paystack keys by prefix or name
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

  if (hasRealPublic || hasRealSecret) {
    return {
      publicKey: rawPublic,
      secretKey: rawSecret,
      source: 'env',
      isConfigured: true,
      isTest: rawPublic.startsWith('pk_test_') || rawSecret.startsWith('sk_test_'),
      isLive: rawPublic.startsWith('pk_live_') || rawSecret.startsWith('sk_live_'),
    };
  }

  return {
    publicKey: rawPublic || '',
    secretKey: rawSecret || '',
    source: 'demo',
    isConfigured: false,
    isTest: false,
    isLive: false,
  };
}

/**
 * Universal JSON response sender compatible with both Vercel Serverless Function (res.status().json())
 * and standard Node.js http.ServerResponse (res.writeHead(), res.end()).
 */
export function sendJson(res: any, statusCode: number, data: any): void {
  if (res.headersSent) return;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
    return;
  }

  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

/**
 * Safely parse JSON body from incoming request in Serverless or Node environment.
 */
export async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (req.body && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}
