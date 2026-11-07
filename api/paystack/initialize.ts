/**
 * Vercel Serverless Function: POST /api/paystack/initialize
 * 100% self-contained with zero external file dependencies to guarantee seamless execution on Vercel
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

function getPaystackKeys(): { publicKey: string; secretKey: string; isConfigured: boolean; isTest: boolean; isLive: boolean } {
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

  return {
    publicKey: rawPublic,
    secretKey: rawSecret,
    isConfigured: hasRealPublic || hasRealSecret,
    isTest: rawPublic.startsWith('pk_test_') || rawSecret.startsWith('sk_test_'),
    isLive: rawPublic.startsWith('pk_live_') || rawSecret.startsWith('sk_live_'),
  };
}

function sendResponse(res: any, statusCode: number, data: any) {
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

async function getRequestBody(req: any): Promise<any> {
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

export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = await getRequestBody(req);
    const { assessmentId, email, assessment } = body || {};

    const id = assessmentId || assessment?.id || `ASMT_${Date.now()}`;
    const studentName = assessment?.studentName || 'Form Four Graduate';
    const customerEmail = email || assessment?.studentEmail || `student_${id.toLowerCase().replace(/[^a-z0-9]/g, '')}@careerassistant.ke`;

    // Generate unique payment reference for every transaction
    const uniqueToken = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reference = `CAKE_${id.replace(/[^a-zA-Z0-9]/g, '')}_${uniqueToken}`;
    const amountInKobo = 10000; // KSh 100 in smallest currency unit (cents/kobo)

    // Determine return callback URL
    const rawOrigin = body?.origin || req.headers?.origin || req.headers?.referer || process.env.APP_URL || '';
    let cleanOrigin = '';
    try {
      if (rawOrigin) {
        const u = new URL(rawOrigin.toString());
        cleanOrigin = `${u.protocol}//${u.host}`;
      }
    } catch (_) {
      cleanOrigin = rawOrigin.toString().replace(/\/$/, '');
    }

    const callback_url = cleanOrigin 
      ? `${cleanOrigin}/?assessmentId=${encodeURIComponent(id)}&reference=${encodeURIComponent(reference)}`
      : undefined;

    const { secretKey, publicKey, isConfigured } = getPaystackKeys();
    const hasUsableSecret = isConfigured && isUsableSecretKey(secretKey);

    if (!hasUsableSecret && !isUsablePublicKey(publicKey)) {
      return sendResponse(res, 400, {
        error: 'Paystack credentials not detected in server environment. If you recently configured PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in Vercel, please trigger a Redeploy on Vercel so the environment variables take effect.',
        code: 'PAYSTACK_NOT_CONFIGURED',
      });
    }

    // 1. Hosted Checkout using Paystack Secret Key
    if (hasUsableSecret) {
      try {
        const payload: any = {
          email: customerEmail,
          amount: amountInKobo,
          currency: 'KES',
          reference,
          metadata: {
            assessmentId: id,
            studentName,
            custom_fields: [
              { display_name: "Student Name", variable_name: "student_name", value: studentName },
              { display_name: "Assessment ID", variable_name: "assessment_id", value: id }
            ]
          },
        };

        if (callback_url) {
          payload.callback_url = callback_url;
        }

        let response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        let paystackData: any = null;
        try {
          paystackData = await response.json();
        } catch (_) {}

        // Retry 1: If merchant account requires default currency instead of explicit KES
        if (paystackData && !paystackData.status && paystackData.message && paystackData.message.toLowerCase().includes('currency')) {
          delete payload.currency;
          response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          try {
            paystackData = await response.json();
          } catch (_) {}
        }

        // Retry 2: If callback_url is rejected (e.g. domain not whitelisted)
        if (paystackData && !paystackData.status && paystackData.message && (paystackData.message.toLowerCase().includes('callback') || paystackData.message.toLowerCase().includes('url'))) {
          delete payload.callback_url;
          response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          try {
            paystackData = await response.json();
          } catch (_) {}
        }

        if (paystackData?.status && paystackData?.data?.authorization_url) {
          return sendResponse(res, 200, {
            status: true,
            authorization_url: paystackData.data.authorization_url,
            access_code: paystackData.data.access_code,
            reference,
            amount: 100,
            currency: 'KES',
            email: customerEmail,
            publicKey,
            callback_url,
          });
        }

        // Fallback: If hosted checkout rejected but public key is usable
        if (paystackData && !paystackData.status) {
          console.error('Paystack API rejection notice:', paystackData);
          if (isUsablePublicKey(publicKey)) {
            return sendResponse(res, 200, {
              status: true,
              reference,
              amount: 100,
              currency: 'KES',
              email: customerEmail,
              publicKey,
              useClientInline: true,
              warning: paystackData.message,
            });
          }

          return sendResponse(res, 400, {
            error: paystackData.message || 'Payment initialization was rejected by Paystack.',
            code: 'PAYSTACK_REJECTED',
          });
        }
      } catch (networkErr: any) {
        console.warn('Network issue reaching Paystack:', networkErr?.message);
        if (isUsablePublicKey(publicKey)) {
          return sendResponse(res, 200, {
            status: true,
            reference,
            amount: 100,
            currency: 'KES',
            email: customerEmail,
            publicKey,
            useClientInline: true,
          });
        }
      }
    }

    // 2. Client Inline Checkout Fallback
    if (isUsablePublicKey(publicKey)) {
      return sendResponse(res, 200, {
        status: true,
        reference,
        amount: 100,
        currency: 'KES',
        email: customerEmail,
        publicKey,
        useClientInline: true,
      });
    }

    return sendResponse(res, 400, {
      error: 'Unable to initialize transaction with Paystack. Please check your PAYSTACK_SECRET_KEY in Vercel.',
      code: 'PAYSTACK_INIT_FAILED',
    });
  } catch (err: any) {
    console.error('Unexpected error in /api/paystack/initialize:', err);
    return sendResponse(res, 500, {
      error: err?.message || 'Server error initializing payment with Paystack',
      code: 'INTERNAL_ERROR',
    });
  }
}
