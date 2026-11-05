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

type ViewMode = 'landing' | 'wizard' | 'preview' | 'report';

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

    // If returning from Paystack with a transaction reference
    if (reference && savedAssessmentId) {
      setIsLoading(true);
      fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          assessmentId: savedAssessmentId,
        }),
      })
        .then((res) => res.json())
        .then((verifyData) => {
          if (verifyData.status === 'PAID') {
            return fetch(`/api/assessments/${savedAssessmentId}`);
          }
          throw new Error('Payment verification unsuccessful');
        })
        .then((res) => res.json())
        .then((fullAssessment: StudentAssessment) => {
          setCurrentAssessment(fullAssessment);
          setCurrentView('report');
          // Clean up query parameters without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error('Error verifying redirected payment:', err);
          // Restore regular assessment state
          fetch(`/api/assessments/${savedAssessmentId}`)
            .then((r) => r.json())
            .then((a) => {
              setCurrentAssessment(a);
              setCurrentView(a.paymentStatus === 'PAID' ? 'report' : 'preview');
            });
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    // Normal load from localStorage
    if (savedAssessmentId) {
      fetch(`/api/assessments/${savedAssessmentId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Could not restore assessment');
        })
        .then((data: StudentAssessment) => {
          setCurrentAssessment(data);
        })
        .catch(() => {
          localStorage.removeItem('career_assistant_ke_active_id');
        });
    }
  }, []);

  // Handle Assessment Completion from Wizard
  const handleAssessmentComplete = async (inputData: any) => {
    setIsLoading(true);
    setGlobalError('');

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assessment.');
      }

      const fullAssessment = await response.json();

      setCurrentAssessment(fullAssessment);
      localStorage.setItem('career_assistant_ke_active_id', fullAssessment.id);
      // Show snippet of analysis first; pay 100 KSh via Paystack to unlock and download full report
      setCurrentView(fullAssessment.paymentStatus === 'PAID' ? 'report' : 'preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting assessment:', err);
      setGlobalError(err.message || 'Error processing career assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Payment Success from Paystack Modal
  const handlePaymentSuccess = (updatedAssessment: StudentAssessment) => {
    setCurrentAssessment(updatedAssessment);
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
