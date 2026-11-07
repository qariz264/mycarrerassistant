/**
 * Vercel Serverless Function: POST /api/paystack/verify
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

function getSecretKey(): string {
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

  // Also check if secret key was accidentally placed in public key variable
  if (!rawSecret) {
    const rawPublic = cleanKey(process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY);
    if (rawPublic.startsWith('sk_')) {
      rawSecret = rawPublic;
    }
  }

  return rawSecret;
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
    const { reference, assessmentId, assessment: incomingAssessment } = body || {};

    if (!reference) {
      return sendResponse(res, 400, { error: 'Missing transaction reference for verification' });
    }

    const secretKey = getSecretKey();
    const hasUsableSecret = isUsableSecretKey(secretKey);

    // Accept explicit test simulation tokens in non-production
    const isExplicitTestReference = 
      (reference.startsWith('TEST_') || 
       reference.startsWith('SIM_') || 
       reference === 'ALREADY_PAID') &&
      process.env.NODE_ENV !== 'production';

    if (isExplicitTestReference) {
      let unlockedAssessment = null;
      if (incomingAssessment && typeof incomingAssessment === 'object') {
        unlockedAssessment = {
          ...incomingAssessment,
          paymentStatus: 'PAID',
          isUnlocked: true,
          paidAmount: 100,
          paidAt: new Date().toISOString(),
          paymentReference: reference,
        };
      }

      return sendResponse(res, 200, {
        success: true,
        status: 'PAID',
        isUnlocked: true,
        reference,
        amount: 100,
        paidAt: new Date().toISOString(),
        assessment: unlockedAssessment,
        message: 'Test simulation transaction verified',
      });
    }

    if (!hasUsableSecret) {
      return sendResponse(res, 400, {
        error: 'PAYSTACK_SECRET_KEY is not configured in Vercel. Please add it to your Vercel Environment Variables and redeploy.',
        code: 'CONFIG_MISSING',
      });
    }

    // Call Paystack Server-Side Verification Endpoint
    let verifyData: any = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      try {
        verifyData = await verifyRes.json();
      } catch (_) {
        verifyData = null;
      }

      if (verifyData?.status && verifyData?.data?.status === 'success') {
        break;
      }

      const currStatus = verifyData?.data?.status;
      if (currStatus === 'ongoing' || currStatus === 'pending' || currStatus === 'processing') {
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1200));
          continue;
        }
      }

      break;
    }

    if (verifyData?.status && verifyData?.data && verifyData?.data?.status === 'success') {
      const rawAmount = Number(verifyData.data.amount) || 0;
      // 10000 = KSh 100 in kobo/cents, or 100 in major units
      if (rawAmount >= 100) {
        let unlockedAssessment = null;
        if (incomingAssessment && typeof incomingAssessment === 'object') {
          unlockedAssessment = {
            ...incomingAssessment,
            id: assessmentId || incomingAssessment.id || `ASMT_${Date.now()}`,
            paymentStatus: 'PAID',
            isUnlocked: true,
            paidAmount: 100,
            paidAt: verifyData.data.paid_at || new Date().toISOString(),
            paymentReference: reference,
            gatewayResponse: verifyData.data.gateway_response || 'Approved',
          };
        }

        return sendResponse(res, 200, {
          success: true,
          status: 'PAID',
          isUnlocked: true,
          reference,
          amount: 100,
          currency: verifyData.data.currency || 'KES',
          paidAt: verifyData.data.paid_at || new Date().toISOString(),
          gatewayResponse: verifyData.data.gateway_response || 'Approved',
          assessment: unlockedAssessment,
        });
      } else {
        return sendResponse(res, 400, {
          error: `Paid amount (${rawAmount / 100} KES) is below the required KSh 100 fee.`,
          status: 'amount_mismatch',
        });
      }
    }

    // Handle non-success responses with clear guidance
    const txStatus = verifyData?.data?.status;
    const gatewayResp = verifyData?.data?.gateway_response;

    let userReason = '';
    if (txStatus === 'abandoned') {
      userReason = 'Payment was abandoned or cancelled. Please click "Proceed to Pay" to complete your transaction on Paystack.';
    } else if (txStatus === 'ongoing' || txStatus === 'pending' || txStatus === 'processing') {
      userReason = 'Transaction is currently processing on the payment network. Please wait a few moments and click "I Have Completed Payment — Verify Status" again.';
    } else if (txStatus === 'failed') {
      userReason = `Payment was declined: ${gatewayResp || 'The card or mobile payment could not be processed.'}`;
    } else if (verifyData?.status === false) {
      userReason = verifyData?.message || `Transaction reference "${reference}" could not be found on Paystack.`;
    } else {
      userReason = gatewayResp || (txStatus ? `Transaction status: ${txStatus}` : 'Payment could not be verified by Paystack.');
    }

    return sendResponse(res, 400, {
      error: userReason,
      status: txStatus || 'unverified',
      gatewayResponse: gatewayResp,
    });
  } catch (err: any) {
    console.error('Unexpected error in /api/paystack/verify:', err);
    return sendResponse(res, 500, {
      error: err?.message || 'Server error verifying payment status with Paystack',
      code: 'VERIFICATION_ERROR',
    });
  }
}
