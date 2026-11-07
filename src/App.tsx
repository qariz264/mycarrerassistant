/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AssessmentWizard } from './components/AssessmentWizard';
import { FreePreview } from './components/FreePreview';
import { PaystackModal } from './components/PaystackModal';
import { PaystackConfigModal } from './components/PaystackConfigModal';
import { FullReport } from './components/FullReport';
import { StudentAssessment } from './types';
import { runFullCareerAssessment } from './lib/recommendationEngine';
import { INITIAL_PROGRAMMES } from './data/kuccpsData';

type ViewMode = 'landing' | 'wizard' | 'preview' | 'report';

async function safeParseJson<T>(response: Response): Promise<T | null> {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.toLowerCase().includes('application/json')) {
      return (await response.json()) as T;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to guarantee detailedResults are never lost or downgraded to hollow skeletons
function ensureDetailedAssessment(target: any, fallback?: any): StudentAssessment | null {
  if (!target && !fallback) return null;
  const merged = { ...(fallback || {}), ...(target || {}) };
  if (!merged || !merged.id) return null;

  // If detailedResults with eligible programmes is already present, return merged
  if (merged.detailedResults && Array.isArray(merged.detailedResults.eligibleProgrammes) && merged.detailedResults.eligibleProgrammes.length > 0) {
    return merged as StudentAssessment;
  }

  // If fallback has detailedResults, preserve them
  if (fallback?.detailedResults?.eligibleProgrammes?.length > 0) {
    return {
      ...merged,
      detailedResults: fallback.detailedResults,
      previewSummary: fallback.previewSummary || merged.previewSummary,
    } as StudentAssessment;
  }

  // If subjects are present, recompute the full assessment on the fly!
  if (Array.isArray(merged.subjects) && merged.subjects.length > 0) {
    try {
      const calc = runFullCareerAssessment(
        {
          studentName: merged.studentName || 'Form Four Graduate',
          studentEmail: merged.studentEmail,
          studentPhone: merged.studentPhone,
          kcseYear: parseInt(merged.kcseYear, 10) || 2025,
          indexNumber: merged.indexNumber,
          subjects: merged.subjects,
          hobbies: merged.hobbies || [],
          otherHobby: merged.otherHobby,
          intendedCourse: merged.intendedCourse || "I don't know yet",
        },
        INITIAL_PROGRAMMES
      );
      return {
        ...merged,
        ...calc,
      } as StudentAssessment;
    } catch (e) {
      console.warn('Recomputing assessment failed:', e);
    }
  }

  return merged as StudentAssessment;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [currentAssessment, setCurrentAssessment] = useState<StudentAssessment | null>(null);
  const [isPaystackModalOpen, setIsPaystackModalOpen] = useState<boolean>(false);
  const [isPaystackConfigOpen, setIsPaystackConfigOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');

  // Handle URL parameters (e.g. returning from Paystack redirect) and localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference') || urlParams.get('trxref');
    const paramAssessmentId = urlParams.get('assessmentId');
    const savedAssessmentId = paramAssessmentId || localStorage.getItem('career_assistant_ke_active_id');

    // Check if admin wants to open key config secretly (e.g. ?admin=paystack)
    if (urlParams.get('admin') === 'paystack' || urlParams.get('settings') === 'paystack') {
      setIsPaystackConfigOpen(true);
    }

    // Try fast restore from localStorage cached full assessment if available
    let cachedAssessment: StudentAssessment | null = null;
    const cachedDataStr = localStorage.getItem('career_assistant_ke_active_data');
    if (cachedDataStr) {
      try {
        const parsed = JSON.parse(cachedDataStr);
        if (parsed && typeof parsed === 'object') {
          cachedAssessment = ensureDetailedAssessment(parsed);
          if (cachedAssessment) {
            setCurrentAssessment(cachedAssessment);
          }
        }
      } catch {
        // ignore parse error
      }
    }

    // If returning from Paystack with a transaction reference
    if (reference) {
      setIsLoading(true);
      const activeId = savedAssessmentId || cachedAssessment?.id || 'ASMT_ACTIVE';

      fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          assessmentId: activeId,
          assessment: cachedAssessment,
        }),
      })
        .then(async (res) => {
          const verifyData = await safeParseJson<any>(res);
          if (verifyData && (verifyData.status === 'PAID' || verifyData.success === true)) {
            const rawAssessment = verifyData.assessment || cachedAssessment;
            const fullAssessment = ensureDetailedAssessment(
              {
                ...(rawAssessment || {}),
                paymentStatus: 'PAID',
                isUnlocked: true,
                paidAmount: 100,
                paidAt: verifyData.paidAt || new Date().toISOString(),
                paymentReference: reference,
              },
              cachedAssessment
            );

            if (fullAssessment) {
              setCurrentAssessment(fullAssessment);
              try {
                localStorage.setItem('career_assistant_ke_active_id', fullAssessment.id);
                localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(fullAssessment));
              } catch (_) {}
              setCurrentView('report');
            } else {
              setCurrentView('preview');
            }
          } else {
            throw new Error(verifyData?.error || 'Payment verification pending or unsuccessful');
          }
          // Clean up query parameters without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.warn('Redirected payment check:', err);
          if (cachedAssessment) {
            setCurrentView(cachedAssessment.paymentStatus === 'PAID' ? 'report' : 'preview');
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    // Normal load from server if needed, never overwriting detailed local data with an empty skeleton
    if (savedAssessmentId && (!cachedAssessment || !cachedAssessment.detailedResults)) {
      fetch(`/api/assessments/${savedAssessmentId}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await safeParseJson<StudentAssessment>(res);
            if (data && data.detailedResults) return data;
          }
          return null;
        })
        .then((data: StudentAssessment | null) => {
          if (data) {
            const restored = ensureDetailedAssessment(data, cachedAssessment);
            if (restored) {
              setCurrentAssessment(restored);
              try {
                localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(restored));
              } catch (_) {}
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  // Handle Assessment Completion from Wizard
  const handleAssessmentComplete = async (inputData: any) => {
    setIsLoading(true);
    setGlobalError('');

    let fullAssessment: StudentAssessment | null = null;

    // 1. Try server assessment creation first
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      const data = await safeParseJson<StudentAssessment & { error?: string }>(response);
      if (response.ok && data && data.id) {
        fullAssessment = data;
      } else if (data && data.error) {
        console.warn('Server assessment returned error:', data.error);
      }
    } catch (networkErr) {
      console.warn('Network request failed, running deterministic local computation:', networkErr);
    }

    // 2. Guaranteed instant local calculation fallback so analysis NEVER fails or crashes
    if (!fullAssessment) {
      try {
        const calculated = runFullCareerAssessment(
          {
            studentName: inputData.studentName || 'Form Four Graduate',
            studentEmail: inputData.studentEmail,
            studentPhone: inputData.studentPhone,
            kcseYear: parseInt(inputData.kcseYear, 10) || 2025,
            indexNumber: inputData.indexNumber,
            subjects: inputData.subjects || [],
            hobbies: inputData.hobbies || [],
            otherHobby: inputData.otherHobby,
            intendedCourse: inputData.intendedCourse || "I don't know yet",
          },
          INITIAL_PROGRAMMES
        );

        const localId = `ASMT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        fullAssessment = {
          ...calculated,
          id: localId,
          paymentStatus: 'UNPAID',
          paidAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isUnlocked: false,
        };

        // Sync with server in background
        fetch('/api/assessments/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullAssessment),
        }).catch(() => {});
      } catch (calcErr: any) {
        console.error('Local evaluation error:', calcErr);
        setGlobalError('Please select at least 7 KCSE subjects with grades to analyze your career pathways.');
        setIsLoading(false);
        return;
      }
    }

    if (fullAssessment) {
      setCurrentAssessment(fullAssessment);
      localStorage.setItem('career_assistant_ke_active_id', fullAssessment.id);
      try {
        localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(fullAssessment));
      } catch {
        // ignore localStorage quota warnings
      }
      // Show snippet of analysis first; pay 100 KSh via Paystack to unlock and download full report
      setCurrentView(fullAssessment.paymentStatus === 'PAID' ? 'report' : 'preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsLoading(false);
  };

  // Handle Payment Success from Paystack Modal
  const handlePaymentSuccess = (updatedAssessment: StudentAssessment) => {
    const verified = ensureDetailedAssessment(
      {
        ...updatedAssessment,
        paymentStatus: 'PAID',
        isUnlocked: true,
      },
      currentAssessment
    ) || updatedAssessment;

    setCurrentAssessment(verified);
    try {
      localStorage.setItem('career_assistant_ke_active_id', verified.id);
      localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(verified));
    } catch (_) {}

    setIsPaystackModalOpen(false);
    setCurrentView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasActiveAssessment={!!currentAssessment}
        isPaid={currentAssessment?.paymentStatus === 'PAID'}
        onViewActiveReport={() => {
          if (currentAssessment) {
            setCurrentView(currentAssessment.paymentStatus === 'PAID' ? 'report' : 'preview');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* Global Error Banner if any */}
      {globalError && (
        <div className="bg-rose-50 border-b border-rose-200 py-3 px-4 text-center text-xs text-rose-800 flex items-center justify-center gap-2">
          <span>{globalError}</span>
          <button onClick={() => setGlobalError('')} className="underline font-bold ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartAssessment={() => {
              setCurrentView('wizard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'wizard' && (
          <AssessmentWizard
            onComplete={handleAssessmentComplete}
            isLoading={isLoading}
            onCancel={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'preview' && currentAssessment && (
          <FreePreview
            assessment={currentAssessment}
            onUnlock={() => {
              if (currentAssessment.paymentStatus === 'PAID') {
                setCurrentView('report');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setIsPaystackModalOpen(true);
              }
            }}
            isLoadingPayment={isLoading}
          />
        )}

        {currentView === 'report' && currentAssessment && (
          currentAssessment.paymentStatus === 'PAID' ? (
            <FullReport
              assessment={currentAssessment}
              onBackToHome={() => {
                setCurrentView('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <FreePreview
              assessment={currentAssessment}
              onUnlock={() => setIsPaystackModalOpen(true)}
              isLoadingPayment={isLoading}
            />
          )
        )}
      </main>

      {/* Paystack Payment Checkout Modal */}
      {isPaystackModalOpen && currentAssessment && (
        <PaystackModal
          assessment={currentAssessment}
          isOpen={isPaystackModalOpen}
          onClose={() => setIsPaystackModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Global Paystack Key Settings Modal */}
      <PaystackConfigModal
        isOpen={isPaystackConfigOpen}
        onClose={() => setIsPaystackConfigOpen(false)}
      />
    </div>
  );
}
