/**
 * Vercel Serverless Function: /api/assessments
 * Handles assessment generation and retrieval
 */

import { runFullCareerAssessment } from '../src/lib/recommendationEngine.js';
import { INITIAL_PROGRAMMES } from '../src/data/kuccpsData.js';
import { StudentAssessment } from '../src/types/index.js';

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

async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (req.body && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => { resolve({}); });
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { studentName, studentEmail, studentPhone, kcseYear, indexNumber, subjects, hobbies, otherHobby, intendedCourse } = body;

      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return sendJson(res, 400, { error: 'Please enter your KCSE subjects and grades.' });
      }

      const assessmentId = `ASMT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const calculated = runFullCareerAssessment(
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
        INITIAL_PROGRAMMES
      );

      const assessment: StudentAssessment = {
        ...calculated,
        id: assessmentId,
        paymentStatus: 'UNPAID',
        paidAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return sendJson(res, 201, {
        ...assessment,
        isUnlocked: false,
      });
    } catch (err: any) {
      console.error('Error generating assessment in serverless function:', err);
      return sendJson(res, 500, {
        error: 'Failed to process career assessment. Please check inputs and try again.',
      });
    }
  }

  return sendJson(res, 200, { status: 'ready' });
}
