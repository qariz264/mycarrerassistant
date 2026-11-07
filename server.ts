/**
 * Full-Stack Server for Career Assistant KE
 * Express API with Paystack Server-Side Verification & Vite Dev Middleware
 */

import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PROGRAMMES, KENYAN_INSTITUTIONS } from './src/data/kuccpsData.js';
import { runFullCareerAssessment } from './src/lib/recommendationEngine.js';
import { Programme, StudentAssessment, PaymentStatus } from './src/types/index.js';
import { cleanKey, isUsableSecretKey, isUsablePublicKey, getPaystackKeys, type PaystackKeysInfo } from './src/lib/paystackUtils.js';

export { cleanKey, isUsableSecretKey, isUsablePublicKey, getPaystackKeys };
export type { PaystackKeysInfo };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure req.body is always an object even if empty or pre-parsed by serverless proxy
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (_) {}
  }
  if (!req.body || typeof req.body !== 'object') {
    req.body = {};
  }
  next();
});

// Normalize incoming request URLs for Vercel Serverless Function rewrites & proxying
app.use((req, _res, next) => {
  if (req.url) {
    try {
      if (req.url.startsWith('/api/index.ts') || req.url.startsWith('/api/index') || req.url.startsWith('/api?')) {
        const q0 = (req.query as any)?.['0'] || (req.query && Object.values(req.query)[0]);
        if (typeof q0 === 'string' && q0) {
          const search = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
          req.url = `/api/${q0.replace(/^\//, '')}${search}`;
        }
      } else if (!req.url.startsWith('/api') && !req.url.startsWith('/sitemap') && !req.url.startsWith('/robots')) {
        req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
      }
    } catch (_) {}
  }
  next();
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Persistent Data Storage & Paths (use /tmp on Vercel serverless)
const IS_VERCEL = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'career_data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PAYSTACK_CONFIG_FILE = path.join(DATA_DIR, 'paystack-config.json');
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin_ke_2026';




interface DatabaseSchema {
  programmes: Programme[];
  assessments: StudentAssessment[];
  paymentLogs: {
    reference: string;
    assessmentId: string;
    amount: number;
    currency: string;
    status: string;
    verifiedAt: string;
    gatewayResponse?: string;
  }[];
}

function loadDatabase(): DatabaseSchema {
  try {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (_) {}
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DatabaseSchema = JSON.parse(data);
      // Enforce clean, factual programmes from INITIAL_PROGRAMMES (avoiding obsolete 2026/2027 or corrupted cluster fields)
      parsed.programmes = INITIAL_PROGRAMMES;

      // Re-evaluate existing assessments using accurate KUCCPS separation
      if (Array.isArray(parsed.assessments)) {
        parsed.assessments = parsed.assessments.map((a: any) => {
          try {
            const reCalced = runFullCareerAssessment(
              {
                studentName: a.studentName,
                studentEmail: a.studentEmail,
                studentPhone: a.studentPhone,
                kcseYear: a.kcseYear,
                indexNumber: a.indexNumber,
                subjects: a.subjects,
                hobbies: a.hobbies || [],
                otherHobby: a.otherHobby,
                intendedCourse: a.intendedCourse,
              },
              INITIAL_PROGRAMMES
            );
            return {
              ...reCalced,
              id: a.id,
              paymentStatus: a.paymentStatus || 'UNPAID',
              paymentReference: a.paymentReference,
              paidAmount: a.paidAmount ?? 0,
              paidAt: a.paidAt,
              createdAt: a.createdAt,
              updatedAt: a.updatedAt,
            };
          } catch (_) {
            return a;
          }
        });
      }

      return {
        programmes: INITIAL_PROGRAMMES,
        assessments: Array.isArray(parsed.assessments) ? parsed.assessments.slice(-30) : [],
        paymentLogs: Array.isArray(parsed.paymentLogs) ? parsed.paymentLogs.slice(-100) : [],
      };
    }
  } catch (err) {
    console.error('Error loading database, resetting to defaults:', err);
  }

  const initialDb: DatabaseSchema = {
    programmes: INITIAL_PROGRAMMES,
    assessments: [],
    paymentLogs: [],
  };
  return initialDb;
}

function saveDatabase(databaseState: DatabaseSchema) {
  // Asynchronous non-blocking write to avoid stalling the event loop
  setImmediate(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      // Only persist dynamic state (keep latest 30 assessments & 100 payment logs)
      // Exclude programmes from file because INITIAL_PROGRAMMES is statically loaded in memory
      const exportable = {
        assessments: (databaseState.assessments || []).slice(-30),
        paymentLogs: (databaseState.paymentLogs || []).slice(-100),
        savedAt: new Date().toISOString()
      };
      fs.writeFile(DB_FILE, JSON.stringify(exportable), 'utf-8', (err) => {
        if (err) console.error('Error saving database:', err);
      });
    } catch (err) {
      console.error('Error saving database:', err);
    }
  });
}

// In-Memory state synced to file
let db = loadDatabase();

// --------------------------------------------------------------------------------
// SEO SITEMAP & ROBOTS.TXT ROUTES
// --------------------------------------------------------------------------------

// Dynamic sitemap.xml matching current host/origin
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const host = req.headers.host || 'careerassistant.ke';
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=wizard</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#how-it-works</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#what-we-analyze</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.header('Content-Type', 'application/xml; charset=utf-8');
  return res.send(xml);
});

// Dynamic robots.txt pointing to sitemap.xml
app.get('/robots.txt', (req: Request, res: Response) => {
  const host = req.headers.host || 'careerassistant.ke';
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

  const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain; charset=utf-8');
  return res.send(robots);
});

// --------------------------------------------------------------------------------
// API ROUTES
// --------------------------------------------------------------------------------

// Health check
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Career Assistant KE Backend',
    programmesCount: db.programmes.length,
    institutionsCount: KENYAN_INSTITUTIONS.length,
    assessmentsCount: db.assessments.length,
  });
});

// All 514 Verified Kenyan Institutions endpoint
app.get(['/api/institutions', '/institutions'], (req: Request, res: Response) => {
  const { county, type, search } = req.query;
  let list = [...KENYAN_INSTITUTIONS];

  if (county && typeof county === 'string' && county !== 'ALL') {
    list = list.filter(i => i.county.toLowerCase() === county.toLowerCase());
  }

  if (type && typeof type === 'string' && type !== 'ALL') {
    list = list.filter(i => i.type.toLowerCase() === type.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(i => 
      i.name.toLowerCase().includes(q) ||
      i.shortName.toLowerCase().includes(q) ||
      i.code.includes(q) ||
      i.town.toLowerCase().includes(q) ||
      i.county.toLowerCase().includes(q)
    );
  }

  res.json({
    total: list.length,
    allVerifiedCount: KENYAN_INSTITUTIONS.length,
    institutions: list,
  });
});

// Config endpoint for client
app.get(['/api/config', '/config'], (_req, res) => {
  const keys = getPaystackKeys();
  res.json({
    paystackPublicKey: keys.publicKey,
    amountKsh: 100,
    isDemoKey: keys.publicKey.includes('demo') || keys.publicKey.includes('sample'),
    isConfigured: keys.isConfigured,
    isTest: keys.isTest,
  });
});

// 1. Submit Assessment & Generate Preview
app.post(['/api/assessments', '/assessments'], (req: Request, res: Response) => {
  try {
    const { studentName, studentEmail, studentPhone, kcseYear, indexNumber, subjects, hobbies, otherHobby, intendedCourse } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Please enter your KCSE subjects and grades.' });
    }

    const assessmentId = `ASMT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Execute Deterministic KUCCPS & KNEC Engine
    const calculatedAssessment = runFullCareerAssessment(
      {
        studentName: studentName || 'Form Four Graduate',
        studentEmail,
        studentPhone,
        kcseYear: parseInt(kcseYear, 10) || 2025,
        indexNumber,
        subjects,
        hobbies: hobbies || [],
        otherHobby,
        intendedCourse: intendedCourse || "I don't know yet",
      },
      db.programmes
    );

    const newAssessment: StudentAssessment = {
      ...calculatedAssessment,
      id: assessmentId,
      paymentStatus: 'UNPAID',
      paidAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.assessments.push(newAssessment);
    saveDatabase(db);

    // Return the assessment with snippet summary; full report remains locked until Paystack payment
    return res.status(201).json({
      ...newAssessment,
      isUnlocked: false,
    });
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    return res.status(500).json({ error: 'Failed to process career assessment. Please check inputs and try again.' });
  }
});

// Sync assessment computed on client or offline
app.post(['/api/assessments/sync', '/assessments/sync'], (req: Request, res: Response) => {
  try {
    const incoming = req.body as StudentAssessment;
    if (!incoming || !incoming.id) {
      return res.status(400).json({ error: 'Invalid assessment sync payload' });
    }

    const existingIdx = db.assessments.findIndex(a => a.id === incoming.id);
    if (existingIdx >= 0) {
      // Keep payment status if already paid on server
      const current = db.assessments[existingIdx];
      db.assessments[existingIdx] = {
        ...incoming,
        paymentStatus: current.paymentStatus === 'PAID' ? 'PAID' : incoming.paymentStatus,
        isUnlocked: current.paymentStatus === 'PAID' || incoming.isUnlocked,
        updatedAt: new Date().toISOString(),
      };
    } else {
      db.assessments.push({
        ...incoming,
        createdAt: incoming.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    saveDatabase(db);
    return res.json({ status: 'ok', id: incoming.id });
  } catch (error: any) {
    console.error('Error syncing assessment:', error);
    return res.status(500).json({ error: 'Failed to sync assessment' });
  }
});

// 2. Fetch Assessment by ID
app.get(['/api/assessments/:id', '/assessments/:id'], (req: Request, res: Response) => {
  const { id } = req.params;
  const assessment = db.assessments.find(a => a.id === id);

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found. Please check your reference ID.' });
  }

  const isPaid = assessment.paymentStatus === 'PAID';
  return res.json({
    ...assessment,
    isUnlocked: isPaid,
  });
});

// --------------------------------------------------------------------------------
// PAYSTACK CONFIGURATION & PAYMENT API ROUTES
// --------------------------------------------------------------------------------

// Get current Paystack configuration status & public key
app.get(['/api/paystack/config', '/paystack/config'], (_req: Request, res: Response) => {
  const keys = getPaystackKeys();
  const maskSecret = (key: string) => {
    if (!key || key.length < 12) return 'sk_••••••••';
    return `${key.slice(0, 7)}••••••••${key.slice(-4)}`;
  };

  return res.json({
    publicKey: keys.publicKey,
    maskedSecretKey: maskSecret(keys.secretKey),
    isConfigured: keys.isConfigured,
    isTest: keys.isTest,
    isLive: keys.isLive,
    source: keys.source,
  });
});

// Update Paystack keys dynamically (Supports Test & Live keys)
app.post(['/api/paystack/config', '/paystack/config'], async (req: Request, res: Response) => {
  try {
    const { publicKey, secretKey } = req.body;

    if (!publicKey || typeof publicKey !== 'string' || !publicKey.trim()) {
      return res.status(400).json({ error: 'Paystack Public Key is required (e.g., pk_test_...)' });
    }
    if (!secretKey || typeof secretKey !== 'string' || !secretKey.trim()) {
      return res.status(400).json({ error: 'Paystack Secret Key is required (e.g., sk_test_...)' });
    }

    const cleanPublic = cleanKey(publicKey);
    const cleanSecret = cleanKey(secretKey);

    if (!cleanPublic.startsWith('pk_test_') && !cleanPublic.startsWith('pk_live_')) {
      return res.status(400).json({
        error: 'Invalid Public Key format. It should start with "pk_test_" or "pk_live_".',
      });
    }

    if (!cleanSecret.startsWith('sk_test_') && !cleanSecret.startsWith('sk_live_')) {
      return res.status(400).json({
        error: 'Invalid Secret Key format. It should start with "sk_test_" or "sk_live_".',
      });
    }

    // Test connectivity to Paystack with the provided Secret Key
    let paystackValidationMsg = '';
    const skipValidation = req.body.force === true;

    if (!skipValidation) {
      try {
        const testRes = await fetch('https://api.paystack.co/transaction/totals', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${cleanSecret}`,
          },
        });
        const testData = await testRes.json();
        if (testRes.status === 401 || testData.status === false) {
          return res.status(400).json({
            error: `Paystack rejected Secret Key: ${testData.message || 'Unauthorized / Invalid Key'}. Verify that you copied the complete Secret Key from Paystack Dashboard > Settings > API Keys & Webhooks.`,
            canForce: true,
          });
        }
        paystackValidationMsg = 'Key successfully verified with Paystack API.';
      } catch (testErr: any) {
        console.warn('Paystack connectivity test warning:', testErr?.message);
        paystackValidationMsg = 'Key saved (Paystack network verification skipped).';
      }
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const configData = {
      publicKey: cleanPublic,
      secretKey: cleanSecret,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(PAYSTACK_CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf-8');

    // Update process.env in memory
    process.env.PAYSTACK_PUBLIC_KEY = cleanPublic;
    process.env.PAYSTACK_SECRET_KEY = cleanSecret;

    // Update .env file on disk if possible
    try {
      const envPath = path.join(__dirname, '.env');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
      if (!envContent.includes('PAYSTACK_PUBLIC_KEY=')) {
        envContent += `\nPAYSTACK_PUBLIC_KEY="${cleanPublic}"\n`;
      } else {
        envContent = envContent.replace(/PAYSTACK_PUBLIC_KEY=.*(\r?\n|$)/, `PAYSTACK_PUBLIC_KEY="${cleanPublic}"$1`);
      }
      if (!envContent.includes('PAYSTACK_SECRET_KEY=')) {
        envContent += `\nPAYSTACK_SECRET_KEY="${cleanSecret}"\n`;
      } else {
        envContent = envContent.replace(/PAYSTACK_SECRET_KEY=.*(\r?\n|$)/, `PAYSTACK_SECRET_KEY="${cleanSecret}"$1`);
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
    } catch (_) {}

    const maskSecret = (key: string) => `${key.slice(0, 7)}••••••••${key.slice(-4)}`;

    return res.json({
      success: true,
      message: paystackValidationMsg || 'Paystack test keys saved successfully!',
      publicKey: cleanPublic,
      maskedSecretKey: maskSecret(cleanSecret),
      isConfigured: true,
      isTest: cleanPublic.startsWith('pk_test_') || cleanSecret.startsWith('sk_test_'),
      isLive: cleanPublic.startsWith('pk_live_') || cleanSecret.startsWith('sk_live_'),
      source: 'custom',
    });
  } catch (err: any) {
    console.error('Error saving paystack configuration:', err);
    return res.status(500).json({ error: 'Failed to save Paystack configuration' });
  }
});

// Reset Paystack keys to default demo sandbox
app.post(['/api/paystack/config/reset', '/paystack/config/reset'], (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(PAYSTACK_CONFIG_FILE)) {
      fs.unlinkSync(PAYSTACK_CONFIG_FILE);
    }
    delete process.env.PAYSTACK_PUBLIC_KEY;
    delete process.env.PAYSTACK_SECRET_KEY;

    return res.json({
      success: true,
      message: 'Paystack keys reset to default sandbox.',
      isConfigured: false,
      source: 'demo',
    });
  } catch (err: any) {
    console.error('Error resetting paystack configuration:', err);
    return res.status(500).json({ error: 'Failed to reset Paystack configuration' });
  }
});

// 3. Initialize Paystack Transaction
app.post(['/api/paystack/initialize', '/paystack/initialize'], async (req: Request, res: Response) => {
  try {
    const { assessmentId, email, assessment: incomingAssessment } = req.body;
    let assessment: StudentAssessment;
    const found = db.assessments.find(a => a.id === assessmentId);

    // If assessment was computed on client or in different serverless instance, sync it
    if (found) {
      assessment = found;
    } else if (incomingAssessment && incomingAssessment.id) {
      assessment = incomingAssessment;
      db.assessments.push(assessment);
      saveDatabase(db);
    } else {
      // Create minimal placeholder to prevent 404
      assessment = {
        id: assessmentId || `ASMT_${Date.now()}`,
        studentName: 'Form Four Student',
        studentEmail: email,
        kcseYear: 2025,
        subjects: [],
        hobbies: [],
        intendedCourse: "I don't know yet",
        meanGrade: 'C+',
        meanPoints: 7,
        totalAggregate: 46,
        gradePointsDisplay: '46/84 pts',
        studentEstimatedClusterPoints: 32.5,
        paymentStatus: 'UNPAID',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previewSummary: {
          meanGrade: 'C+',
          gradePointsDisplay: '46/84 pts',
          studentEstimatedClusterPoints: 32.5,
          potentialDegreeMatches: 2,
          potentialDiplomaMatches: 5,
          potentialTvetMatches: 8,
          totalEligibleInstitutions: 50,
          intendedCoursePreview: "I don't know yet",
          intendedCourseMeetsMinimums: true,
        },
      };
      db.assessments.push(assessment);
    }

    if (assessment.paymentStatus === 'PAID') {
      return res.json({
        alreadyPaid: true,
        message: 'Assessment is already unlocked',
      });
    }

    // Unique payment reference for every transaction
    const uniqueToken = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reference = `CAKE_${assessment.id.replace(/[^a-zA-Z0-9]/g, '')}_${uniqueToken}`;
    const amountInKobo = 10000; // KSh 100 in smallest currency unit (cents/kobo)
    const customerEmail = email || assessment.studentEmail || `student_${assessment.id.toLowerCase().replace(/[^a-z0-9]/g, '')}@careerassistant.ke`;

    // Determine return callback URL so Paystack redirects back to Career Assistant KE
    const rawOrigin = req.body.origin || req.headers.origin || req.headers.referer || process.env.APP_URL || '';
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
      ? `${cleanOrigin}/?assessmentId=${encodeURIComponent(assessment.id)}&reference=${encodeURIComponent(reference)}`
      : undefined;

    const { secretKey, publicKey, isConfigured } = getPaystackKeys();
    const hasUsableSecret = isConfigured && isUsableSecretKey(secretKey);

    if (!hasUsableSecret && !isUsablePublicKey(publicKey)) {
      return res.status(400).json({
        error: 'Paystack is not configured in this environment. If you added PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in Vercel, please trigger a Redeploy on Vercel (Dashboard > Deployments > Redeploy) so the environment variables take effect.',
        code: 'PAYSTACK_NOT_CONFIGURED',
      });
    }

    // 1. If configured with real/test Paystack secret key, initiate official Paystack hosted checkout
    if (hasUsableSecret) {
      try {
        const payload: any = {
          email: customerEmail,
          amount: amountInKobo,
          currency: 'KES',
          reference,
          metadata: {
            assessmentId: assessment.id,
            studentName: assessment.studentName,
            custom_fields: [
              { display_name: "Student Name", variable_name: "student_name", value: assessment.studentName },
              { display_name: "KCSE Year", variable_name: "kcse_year", value: String(assessment.kcseYear) }
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
          assessment.paymentStatus = 'PAYMENT_PENDING';
          saveDatabase(db);
          return res.json({
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

        // Fallback to client inline popup if Paystack rejected hosted initialization but public key is valid
        if (paystackData && !paystackData.status) {
          console.error('Paystack initialization rejected by API:', paystackData);
          if (isUsablePublicKey(publicKey)) {
            console.log('Falling back to client-side inline checkout using public key');
            assessment.paymentStatus = 'PAYMENT_PENDING';
            saveDatabase(db);
            return res.json({
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
          return res.status(400).json({
            error: paystackData.message || 'Payment initialization was rejected by Paystack.',
            code: 'PAYSTACK_REJECTED',
          });
        }
      } catch (paystackErr: any) {
        console.warn('Paystack network error during init:', paystackErr?.message);
        if (isUsablePublicKey(publicKey)) {
          assessment.paymentStatus = 'PAYMENT_PENDING';
          saveDatabase(db);
          return res.json({
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

    // 2. Client inline initialization fallback if public key is available
    if (isUsablePublicKey(publicKey)) {
      assessment.paymentStatus = 'PAYMENT_PENDING';
      saveDatabase(db);

      return res.json({
        status: true,
        reference,
        amount: 100,
        currency: 'KES',
        email: customerEmail,
        publicKey: publicKey,
        useClientInline: true,
      });
    }

    return res.status(400).json({
      error: 'Unable to initialize transaction with Paystack. Please ensure your PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY are correctly configured in Vercel.',
      code: 'PAYSTACK_INIT_FAILED',
    });
  } catch (error: any) {
    console.error('Error initializing payment:', error);
    return res.status(500).json({
      error: error?.message || 'Server error initializing payment with Paystack',
    });
  }
});

// 4. Verify Paystack Transaction on Server
app.post(['/api/paystack/verify', '/paystack/verify'], async (req: Request, res: Response) => {
  try {
    const { reference, assessmentId, assessment: incomingAssessment } = req.body;

    if (!reference || !assessmentId) {
      return res.status(400).json({ error: 'Missing reference or assessmentId for verification' });
    }

    let assessment: StudentAssessment;
    const found = db.assessments.find(a => a.id === assessmentId);
    if (found) {
      assessment = {
        ...found,
        ...(incomingAssessment || {}),
        id: found.id || assessmentId,
      };
      const idx = db.assessments.findIndex(a => a.id === assessmentId);
      if (idx !== -1) {
        db.assessments[idx] = assessment;
        saveDatabase(db);
      }
    } else if (incomingAssessment && incomingAssessment.id) {
      assessment = incomingAssessment;
      db.assessments.push(assessment);
      saveDatabase(db);
    } else {
      assessment = {
        id: assessmentId,
        studentName: 'Form Four Student',
        kcseYear: 2025,
        subjects: [],
        hobbies: [],
        intendedCourse: "I don't know yet",
        meanGrade: 'C+',
        meanPoints: 7,
        totalAggregate: 46,
        gradePointsDisplay: '46/84 pts',
        studentEstimatedClusterPoints: 32.5,
        paymentStatus: 'UNPAID',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previewSummary: {
          meanGrade: 'C+',
          gradePointsDisplay: '46/84 pts',
          studentEstimatedClusterPoints: 32.5,
          potentialDegreeMatches: 2,
          potentialDiplomaMatches: 5,
          potentialTvetMatches: 8,
          totalEligibleInstitutions: 50,
          intendedCoursePreview: "I don't know yet",
          intendedCourseMeetsMinimums: true,
        },
      };
      db.assessments.push(assessment);
    }

    // Prevent duplicate processing
    const existingLog = db.paymentLogs.find(p => p.reference === reference && p.status === 'success');
    if (existingLog) {
      assessment.paymentStatus = 'PAID';
      assessment.isUnlocked = true;
      assessment.paidAmount = existingLog.amount;
      assessment.paidAt = existingLog.verifiedAt;
      assessment.paymentReference = reference;
      saveDatabase(db);
      return res.json({ 
        success: true, 
        status: 'PAID', 
        isUnlocked: true, 
        assessmentId: assessment.id,
        assessment,
        message: 'Payment previously verified.' 
      });
    }

    let isVerified = false;
    let verifiedAmount = 100;
    let gatewayMessage = '';
    let verifiedCurrency = 'KES';
    let verifiedPaidAt = new Date().toISOString();

    const { secretKey, isConfigured } = getPaystackKeys();
    const hasUsableSecret = isConfigured && isUsableSecretKey(secretKey);

    // Test simulation tokens (only accepted in non-production environments)
    const isExplicitTestReference = 
      (reference.startsWith('TEST_') || 
       reference.startsWith('SIM_') || 
       reference === 'ALREADY_PAID') &&
      process.env.NODE_ENV !== 'production';

    if (isExplicitTestReference) {
      isVerified = true;
      verifiedAmount = 100;
      gatewayMessage = 'Test simulation verified';
    } else if (hasUsableSecret) {
      try {
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
          // Subunits: 10000 = KSh 100 (or major unit: 100)
          if (rawAmount >= 100) {
            isVerified = true;
            verifiedAmount = rawAmount >= 1000 ? rawAmount / 100 : rawAmount;
            gatewayMessage = verifyData.data.gateway_response || 'Approved';
            verifiedCurrency = verifyData.data.currency || 'KES';
            if (verifyData.data.paid_at) {
              verifiedPaidAt = verifyData.data.paid_at;
            }
          } else {
            return res.status(400).json({ 
              error: `Paid amount (${rawAmount / 100} KES) is below the required KSh 100 fee.`,
              status: 'amount_mismatch'
            });
          }
        } else {
          // Paystack did NOT confirm success
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
            userReason = gatewayResp || (txStatus ? `Transaction status: ${txStatus}` : 'Payment could not be verified.');
          }

          if (txStatus === 'failed') {
            assessment.paymentStatus = 'PAYMENT_FAILED';
          } else {
            assessment.paymentStatus = 'PAYMENT_PENDING';
          }
          saveDatabase(db);

          return res.status(400).json({
            error: userReason,
            status: txStatus || 'unverified',
            gatewayResponse: gatewayResp,
          });
        }
      } catch (liveErr: any) {
        console.error('Error during Paystack API verification:', liveErr);
        return res.status(502).json({
          error: 'Unable to reach Paystack to verify payment status. Please check your connection and retry.',
          status: 'gateway_unreachable',
        });
      }
    } else {
      return res.status(400).json({
        error: 'Paystack secret key is not configured in the server environment. Please configure PAYSTACK_SECRET_KEY in your Vercel Environment Variables to verify transactions.',
        status: 'config_missing',
      });
    }

    if (isVerified) {
      const nowIso = new Date().toISOString();
      assessment.paymentStatus = 'PAID';
      assessment.isUnlocked = true;
      assessment.paymentReference = reference;
      assessment.paidAmount = verifiedAmount;
      assessment.paidAt = verifiedPaidAt || nowIso;
      assessment.updatedAt = nowIso;

      db.paymentLogs.push({
        reference,
        assessmentId: assessment.id,
        amount: verifiedAmount,
        currency: verifiedCurrency,
        status: 'success',
        verifiedAt: assessment.paidAt,
        gatewayResponse: gatewayMessage,
      });

      saveDatabase(db);

      return res.json({
        success: true,
        status: 'PAID',
        isUnlocked: true,
        assessmentId: assessment.id,
        assessment,
        message: 'Payment verified successfully. Full career report unlocked!',
      });
    }

    assessment.paymentStatus = 'PAYMENT_FAILED';
    saveDatabase(db);
    return res.status(400).json({ error: 'Payment could not be verified. Please check reference.' });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Internal error verifying payment. Please retry.' });
  }
});

// 5. AI Career Counselor Guidance (Server-Side @google/genai)
app.post('/api/assessments/:id/ai-explain', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = db.assessments.find(a => a.id === id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.paymentStatus !== 'PAID') {
      return res.status(403).json({ error: 'Full AI guidance is only available after unlocking the report.' });
    }

    // Return cached explanation if already generated
    if (assessment.detailedResults?.aiCounselorGuidance) {
      return res.json({ guidance: assessment.detailedResults.aiCounselorGuidance });
    }

    // Call Gemini 3.8 Flash to generate an encouraging, clear, educational guidance summary
    const qualifyingCategories = Array.from(new Set(
      (assessment.detailedResults?.eligibleProgrammes || []).map(p => p.category)
    ));
    const unmetSubjects = Array.from(new Set(
      (assessment.detailedResults?.allEvaluations || [])
        .flatMap(p => p.subjectChecks.filter(sc => !sc.passed).map(sc => `${sc.subject} (needs ${sc.requiredGrade})`))
    )).slice(0, 5);

    const prompt = `
You are an expert Kenyan academic counselor helping a Form Four KCSE graduate interpret their career options for KUCCPS placement.

Student Assessment Data:
- Student Name: ${assessment.studentName}
- KCSE Examination Year: ${assessment.kcseYear}
- KCSE Mean Grade: ${assessment.meanGrade} (Aggregate: ${assessment.totalAggregate}/84)
- Estimated Weighted Cluster Points: ${assessment.studentEstimatedClusterPoints} (Degree baseline)
- Verified Subjects & Grades: ${assessment.subjects.map(s => `${s.subject}: ${s.grade}`).join(', ')}
- Stated Hobbies & Interests: ${assessment.hobbies.join(', ')} ${assessment.otherHobby ? `(Other: ${assessment.otherHobby})` : ''}
- Intended Course: ${assessment.intendedCourse}
- Intended Course Eligibility: ${assessment.detailedResults?.intendedCourseAnalysis.status}
- Qualifying Discovery Categories: ${qualifyingCategories.join(', ') || 'All general fields'}
- Total Confirmed Qualifying Programmes: ${assessment.detailedResults?.eligibleProgrammes.length || 0}
- Key Subjects Limiting Access to Certain Programmes: ${unmetSubjects.length > 0 ? unmetSubjects.join(', ') : 'None identified'}
- Top Recommended Programmes: ${assessment.detailedResults?.topRecommendations.map(r => `${r.programmeName} (${r.level})`).join(', ')}
- Alternative TVET Pathways: ${assessment.detailedResults?.alternativePathways.map(a => `${a.programmeName} (${a.reason})`).join(', ')}

Please provide an encouraging, straightforward, data-driven 3-paragraph career advisory for this student:
1. Academic Strengths & Discovery Horizon: Praise the specific subjects they excelled in. Remind them they are not limited to one single career category; highlight 2-3 fields they qualify for based on their actual results.
2. Honest Guidance on their Intended Course & Alternatives: If they met requirements, explain how to prepare; if they fell short on specific subjects, clearly explain why without discouragement and present the TVET / diploma progression pathway.
3. Actionable Next Steps for KUCCPS: Provide 3 concrete tips on how to balance their degree and diploma choices on the official KUCCPS student portal.

Important Guidelines:
- Ground your advice STRICTLY in the provided data. Do not invent grades, cut-offs, or guarantee placement.
- Use Kenyan educational terminology (KUCCPS, TVET, National Polytechnics, University credit transfer).
- Keep the tone respectful, professional, and practical.
`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an authentic, wise, and highly respected Kenyan education counselor and career mentor.',
      },
    });

    const guidanceText = aiResponse.text || 'We encourage you to review your recommended courses and confirm current requirements with KUCCPS.';

    if (assessment.detailedResults) {
      assessment.detailedResults.aiCounselorGuidance = guidanceText;
      saveDatabase(db);
    }

    return res.json({ guidance: guidanceText });
  } catch (error: any) {
    console.error('Error generating AI guidance:', error);
    // Graceful fallback
    return res.json({
      guidance: 'Based on your KCSE subject combination and interests, you have strong pathways available across both university and TVET programmes. Ensure you balance your KUCCPS choices between ambitious degree programmes and solid diploma options.',
    });
  }
});

// --------------------------------------------------------------------------------
// ADMIN API ROUTES
// --------------------------------------------------------------------------------

// Middleware to authenticate admin requests
function requireAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['x-admin-key'] || req.query.adminKey;
  if (authHeader === ADMIN_SECRET) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid Admin Secret Key' });
}

// Admin Analytics
app.get('/api/admin/analytics', requireAdmin, (_req: Request, res: Response) => {
  const total = db.assessments.length;
  const paid = db.assessments.filter(a => a.paymentStatus === 'PAID').length;
  const unpaid = total - paid;
  const conversionRate = total > 0 ? Number(((paid / total) * 100).toFixed(1)) : 0;
  const totalRevenue = paid * 100;

  const assessmentsByYear: Record<number, number> = {};
  const courseCounts: Record<string, number> = {};
  const hobbyCounts: Record<string, number> = {};
  const gradeDist: Record<string, number> = {};

  for (const a of db.assessments) {
    assessmentsByYear[a.kcseYear] = (assessmentsByYear[a.kcseYear] || 0) + 1;
    gradeDist[a.meanGrade] = (gradeDist[a.meanGrade] || 0) + 1;
    if (a.intendedCourse) {
      courseCounts[a.intendedCourse] = (courseCounts[a.intendedCourse] || 0) + 1;
    }
    for (const h of a.hobbies || []) {
      hobbyCounts[h] = (hobbyCounts[h] || 0) + 1;
    }
  }

  const mostSelectedCourses = Object.entries(courseCounts)
    .map(([course, count]) => ({ course, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const popularHobbies = Object.entries(hobbyCounts)
    .map(([hobby, count]) => ({ hobby, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return res.json({
    totalAssessments: total,
    paidAssessments: paid,
    unpaidAssessments: unpaid,
    conversionRate,
    totalRevenueKsh: totalRevenue,
    assessmentsByYear,
    mostSelectedCourses,
    popularHobbies,
    gradeDistribution: gradeDist,
  });
});

// Admin Assessments List
app.get('/api/admin/assessments', requireAdmin, (req: Request, res: Response) => {
  const { search, status } = req.query;
  let list = [...db.assessments];

  if (status && status !== 'ALL') {
    list = list.filter(a => a.paymentStatus === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(a => 
      a.studentName.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.studentEmail && a.studentEmail.toLowerCase().includes(q)) ||
      a.intendedCourse.toLowerCase().includes(q)
    );
  }

  // Sort descending by date
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json(list.map(a => ({
    id: a.id,
    studentName: a.studentName,
    studentEmail: a.studentEmail,
    kcseYear: a.kcseYear,
    meanGrade: a.meanGrade,
    studentEstimatedClusterPoints: a.studentEstimatedClusterPoints,
    intendedCourse: a.intendedCourse,
    paymentStatus: a.paymentStatus,
    paymentReference: a.paymentReference,
    paidAmount: a.paidAmount,
    createdAt: a.createdAt,
  })));
});

// Admin Programmes Management
app.get('/api/admin/programmes', requireAdmin, (_req, res) => {
  res.json(db.programmes);
});

app.post('/api/admin/programmes', requireAdmin, (req: Request, res: Response) => {
  try {
    const newProg: Programme = {
      ...req.body,
      id: `prog-${Date.now()}`,
      active: req.body.active !== false,
    };
    db.programmes.push(newProg);
    saveDatabase(db);
    return res.status(201).json(newProg);
  } catch (err: any) {
    return res.status(400).json({ error: 'Failed to add programme' });
  }
});

app.put('/api/admin/programmes/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.programmes.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Programme not found' });
  }
  db.programmes[index] = { ...db.programmes[index], ...req.body };
  saveDatabase(db);
  return res.json(db.programmes[index]);
});

app.delete('/api/admin/programmes/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.programmes = db.programmes.filter(p => p.id !== id);
  saveDatabase(db);
  return res.json({ success: true });
});

// --------------------------------------------------------------------------------
// GLOBAL EXPRESS ERROR HANDLER
// --------------------------------------------------------------------------------
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) return;
  return res.status(500).json({
    error: err?.message || 'Internal server error processing request',
    code: 'SERVER_ERROR',
  });
});

// --------------------------------------------------------------------------------
// DEV SERVER & STANDALONE LISTENER
// --------------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    try {
      const vitePkg = 'vite';
      const { createServer } = await import(/* @vite-ignore */ vitePkg);
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite dev middleware not loaded:', e);
    }
  } else if (!process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Assistant KE server running on http://0.0.0.0:${PORT}`);
  });
}

// Start listener for standalone/dev server (omitted only in Vercel/Lambda serverless)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}


export default app;
export { app };

