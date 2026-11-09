import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Lock,
  FileDown,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { StudentAssessment } from '../types';
import { PaystackConfigInfo } from './PaystackConfigModal';
import { generateCareerReportPDF } from '../lib/pdfGenerator';

interface PaystackModalProps {
  assessment: StudentAssessment;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedAssessment: StudentAssessment) => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [emailInput, setEmailInput] = useState<string>(
    assessment.studentEmail || ''
  );
  const [phoneInput, setPhoneInput] = useState<string>(
    assessment.studentPhone || ''
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verificationStage, setVerificationStage] = useState<'idle' | 'initiating' | 'awaiting_payment' | 'verifying_server' | 'failed' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentReference, setCurrentReference] = useState<string>('');
  const [authUrl, setAuthUrl] = useState<string>('');
  const [manualReference, setManualReference] = useState<string>('');
  const [confirmedAssessment, setConfirmedAssessment] = useState<StudentAssessment | null>(null);
  
  // Paystack configuration state loaded from server
  const [paystackConfig, setPaystackConfig] = useState<PaystackConfigInfo | null>(null);

  // Hidden admin mode check (only active if ?admin=paystack in URL)
  const isAdminSession = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('admin') === 'paystack';

  const safeParseJson = async <T,>(res: Response): Promise<T | null> => {
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.toLowerCase().includes('application/json')) {
        return (await res.json()) as T;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Load Paystack configuration on mount
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/paystack/config');
      if (res.ok) {
        const data = await safeParseJson<PaystackConfigInfo>(res);
        if (data) setPaystackConfig(data);
      }
    } catch (e) {
      console.warn('Could not load Paystack configuration:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      if (assessment.studentEmail && !emailInput) {
        setEmailInput(assessment.studentEmail);
      }
      if (assessment.studentPhone && !phoneInput) {
        setPhoneInput(assessment.studentPhone);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Ensure Paystack inline script is loaded
  const ensurePaystackLoaded = (): Promise<boolean> => {
    if (window.PaystackPop) return Promise.resolve(true);

    return new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existing) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.PaystackPop || attempts > 20) {
            clearInterval(interval);
            resolve(!!window.PaystackPop);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Initialize Paystack checkout
  const handleInitiatePaystack = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    setVerificationStage('initiating');

    try {
      const customerEmail = emailInput.trim() || `student_${assessment.id.toLowerCase().replace(/[^a-z0-9]/g, '')}@careerassistant.ke`;
      const returnUrl = `${window.location.origin}/?assessmentId=${encodeURIComponent(assessment.id)}`;

      // 1. Initialize Paystack transaction on the server
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          email: customerEmail,
          origin: window.location.origin,
          assessment: assessment,
        }),
      });

      let initData: any = null;
      let rawInitText = '';
      try {
        rawInitText = await initRes.text();
        try {
          initData = JSON.parse(rawInitText);
        } catch {}
      } catch (e: any) {
        rawInitText = e?.message || '';
      }

      if (!initRes.ok || !initData || !initData.status) {
        // Fallback: If client has usable public key, try direct Paystack Pop setup
        const activePublicKey = initData?.publicKey || paystackConfig?.publicKey;
        if (activePublicKey && (activePublicKey.startsWith('pk_live_') || activePublicKey.startsWith('pk_test_'))) {
          const scriptReady = await ensurePaystackLoaded();
          if (scriptReady && window.PaystackPop) {
            const activeRef = `CAKE_${assessment.id.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
            setCurrentReference(activeRef);
            try {
              localStorage.setItem('career_assistant_ke_active_ref', activeRef);
              localStorage.setItem('career_assistant_ke_active_id', assessment.id);
              localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(assessment));
            } catch (_) {}

            setVerificationStage('awaiting_payment');
            setIsProcessing(false);

            const handler = window.PaystackPop.setup({
              key: activePublicKey,
              email: customerEmail,
              amount: 10000, // KSh 100 in cents/kobo
              currency: 'KES',
              ref: activeRef,
              callback_url: `${returnUrl}&reference=${encodeURIComponent(activeRef)}`,
              metadata: {
                assessmentId: assessment.id,
                studentName: assessment.studentName,
                custom_fields: [
                  { display_name: "Student Name", variable_name: "student_name", value: assessment.studentName },
                  { display_name: "KCSE Year", variable_name: "kcse_year", value: String(assessment.kcseYear) }
                ]
              },
              callback: function (response: any) {
                const confirmedRef = response?.reference || response?.trxnref || activeRef;
                handleVerifyOnServer(confirmedRef);
              },
              onClose: function () {
                setIsProcessing(false);
                setVerificationStage('awaiting_payment');
              },
            });
            handler.openIframe();
            return;
          }
        }

        setIsProcessing(false);
        setVerificationStage('failed');
        const detailedError = 
          initData?.error || 
          initData?.message || 
          (rawInitText && !rawInitText.startsWith('<!') ? rawInitText.slice(0, 160) : '') ||
          'Payment service is currently unavailable. Please check connection and click Proceed to Pay again.';
        setErrorMessage(detailedError);
        return;
      }

      if (initData.alreadyPaid) {
        await handleVerifyOnServer(assessment.paymentReference || 'ALREADY_PAID');
        return;
      }

      const activeRef = initData.reference;
      if (activeRef) {
        setCurrentReference(activeRef);
        try {
          localStorage.setItem('career_assistant_ke_active_ref', activeRef);
          localStorage.setItem('career_assistant_ke_active_id', assessment.id);
          localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(assessment));
        } catch (_) {}
      }

      // 2. Official hosted payment redirect to Paystack interface
      if (initData.authorization_url) {
        setAuthUrl(initData.authorization_url);
        window.location.href = initData.authorization_url;
        return;
      }

      // 3. Client inline modal fallback if public key is supplied
      if (initData.publicKey) {
        const scriptReady = await ensurePaystackLoaded();
        if (scriptReady && window.PaystackPop) {
          setVerificationStage('awaiting_payment');
          setIsProcessing(false);

          const handler = window.PaystackPop.setup({
            key: initData.publicKey,
            email: customerEmail,
            amount: 10000, // KSh 100 in cents/kobo
            currency: 'KES',
            ref: activeRef,
            callback_url: `${returnUrl}&reference=${encodeURIComponent(activeRef)}`,
            metadata: {
              assessmentId: assessment.id,
              studentName: assessment.studentName,
              custom_fields: [
                { display_name: "Student Name", variable_name: "student_name", value: assessment.studentName },
                { display_name: "KCSE Year", variable_name: "kcse_year", value: String(assessment.kcseYear) }
              ]
            },
            callback: function (response: any) {
              const confirmedRef = response?.reference || response?.trxnref || activeRef;
              handleVerifyOnServer(confirmedRef);
            },
            onClose: function () {
              setIsProcessing(false);
              setVerificationStage('awaiting_payment');
            },
          });
          handler.openIframe();
          return;
        }
      }

      setVerificationStage('awaiting_payment');
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Initialization error:', err);
      setVerificationStage('failed');
      setErrorMessage(err?.message || 'Network error preparing checkout. Please check your connection and click Proceed to Pay again.');
      setIsProcessing(false);
    }
  };

  // Step 2: Strict Server-Side Verification with Paystack API
  const handleVerifyOnServer = async (ref?: string) => {
    const targetRef = ref || manualReference.trim() || currentReference;
    if (!targetRef) {
      setErrorMessage('Please enter your transaction reference.');
      return;
    }

    setVerificationStage('verifying_server');
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const verifyRes = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: targetRef,
          assessmentId: assessment.id,
          assessment: assessment,
        }),
      });

      let verifyData: any = null;
      let rawVerifyText = '';
      try {
        rawVerifyText = await verifyRes.text();
        try {
          verifyData = JSON.parse(rawVerifyText);
        } catch {}
      } catch (e: any) {
        rawVerifyText = e?.message || '';
      }

      if (verifyRes.ok && verifyData && (verifyData.status === 'PAID' || verifyData.success === true)) {
        // Fetch or use unlocked assessment
        let fullAssessment = verifyData.assessment;
        if (!fullAssessment) {
          const fullRes = await fetch(`/api/assessments/${assessment.id}`);
          fullAssessment = await safeParseJson<any>(fullRes);
        }

        const confirmed: StudentAssessment = {
          ...assessment,
          ...(fullAssessment || {}),
          paymentStatus: 'PAID',
          isUnlocked: true,
          paidAmount: 100,
          paidAt: verifyData?.paidAt || new Date().toISOString(),
          paymentReference: targetRef,
        };

        // Cache unlocked report locally
        try {
          localStorage.setItem('career_assistant_ke_active_id', confirmed.id);
          localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(confirmed));
        } catch (_) {}

        setConfirmedAssessment(confirmed);
        setVerificationStage('success');
        setIsProcessing(false);
        return;
      }

      // Verification failed or was rejected by Paystack
      setVerificationStage('failed');
      setErrorMessage(
        verifyData?.error || 
        (rawVerifyText && !rawVerifyText.startsWith('<!') ? rawVerifyText.slice(0, 160) : '') ||
        'Payment could not be verified by Paystack. Please ensure payment was completed and retry.'
      );
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Verification request network issue:', err);
      setVerificationStage('failed');
      setErrorMessage('Network error checking payment status with server. Please check your connection and retry.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 sm:p-7 text-slate-900 my-auto max-h-[94vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => {
            if (verificationStage === 'success' && confirmedAssessment) {
              onPaymentSuccess(confirmedAssessment);
            } else {
              onClose();
            }
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          disabled={isProcessing && verificationStage === 'verifying_server'}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ------------------------------------------------------------- */}
        {/* STAGE: VERIFYING WITH SERVER */}
        {/* ------------------------------------------------------------- */}
        {verificationStage === 'verifying_server' && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="w-9 h-9 text-sky-600 animate-spin mx-auto" />
            <div className="text-base font-bold text-slate-900">Verifying Transaction...</div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Confirming transaction status with the payment network. Please do not close this window.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE: CONFIRMED PAYMENT (THE LAST PAYMENT CARD) */}
        {/* ------------------------------------------------------------- */}
        {verificationStage === 'success' && (
          <div className="py-2 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Payment Confirmed</div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">Career Report Unlocked!</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                KSh 100 payment verified successfully. Your comprehensive KUCCPS placement analysis and PDF are ready.
              </p>
            </div>

            {/* Receipt Summary Strip */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-bold text-slate-900">KSh 100.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Reference:</span>
                <span className="text-sky-700 truncate max-w-[200px]">{currentReference || confirmedAssessment?.paymentReference || assessment.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-emerald-600">✓ OFFICIAL UNLOCKED</span>
              </div>
            </div>

            {/* Two Action Buttons: View Report & Download PDF */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const target = confirmedAssessment || { ...assessment, paymentStatus: 'PAID', isUnlocked: true };
                  onPaymentSuccess(target);
                }}
                className="w-full py-3.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Complete Career Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = confirmedAssessment || { ...assessment, paymentStatus: 'PAID', isUnlocked: true };
                  generateCareerReportPDF(target);
                }}
                className="w-full py-3 px-4 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-emerald-600" />
                <span>Download Official PDF Report</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              Your unlocked report is permanently available in this browser. You can re-download the PDF anytime.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE: IDLE / INITIATING / AWAITING / FAILED */}
        {/* ------------------------------------------------------------- */}
        {verificationStage !== 'verifying_server' && verificationStage !== 'success' && (
          <div className="space-y-4">
            
            {/* Header */}
            <div>
              <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">
                Official Career Guidance
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Proceed to Pay
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant access to all 150+ qualifying KUCCPS courses and downloadable official PDF.
              </p>
            </div>

            {/* Amount Display */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Due</span>
                <span className="text-xs text-slate-600">One-time official unlock fee</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 font-mono">KSh 100</span>
            </div>

            {/* Error Message banner if failed */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* AWAITING PAYMENT STATE */}
            {verificationStage === 'awaiting_payment' && (
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-3.5">
                <div className="flex items-center gap-2 text-xs text-sky-800 font-bold">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span>Payment Window Active</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Please complete the KSh 100 transaction in the Paystack checkout window or on your phone via M-Pesa. Once finished, click below to unlock your report:
                </p>

                {authUrl && (
                  <a
                    href={authUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-center cursor-pointer"
                  >
                    <span>Reopen Paystack Window</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="pt-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyOnServer(currentReference)}
                    className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Completed Payment — Unlock Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationStage('idle')}
                    className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Change phone or email details
                  </button>
                </div>
              </div>
            )}

            {/* IDLE / FORM STAGE */}
            {verificationStage === 'idle' && (
              <>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Email Address (For payment receipt)
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Phone Number (Optional — for M-Pesa push)
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="0712345678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Primary Proceed to Pay Button */}
                <button
                  type="button"
                  onClick={handleInitiatePaystack}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Preparing Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Pay KSh 100</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}

            {/* FAILED STAGE */}
            {verificationStage === 'failed' && (
              <div className="space-y-2 pt-1">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleInitiatePaystack}
                    className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Retry Payment (KSh 100)</span>
                  </button>

                  {currentReference && (
                    <button
                      type="button"
                      onClick={() => handleVerifyOnServer(currentReference)}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Check Status Again</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setVerificationStage('idle');
                    }}
                    className="w-full py-2 px-4 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Start Over / Re-enter Details
                  </button>

                  {/* Hidden simulator button only visible when explicitly in admin mode (?admin=paystack) */}
                  {isAdminSession && (
                    <button
                      type="button"
                      onClick={() => handleVerifyOnServer(`TEST_SIM_${assessment.id}_${Date.now()}`)}
                      className="w-full py-2 px-3 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>Admin Quick Unlock</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Payment security info */}
            <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Secured by Paystack</span>
              <span>·</span>
              <span className="font-semibold text-emerald-700">M-Pesa Express & Cards</span>
            </div>

            {/* Manual reference verification option if needed */}
            <div className="pt-2 border-t border-slate-100">
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer hover:text-slate-800 font-medium">
                  Already paid or have a reference code? Click to verify
                </summary>
                <div className="mt-2.5 space-y-2">
                  <input
                    type="text"
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    placeholder="e.g. CAKE_... or Paystack reference"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyOnServer(manualReference)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg font-medium text-xs cursor-pointer transition-colors"
                  >
                    Verify Reference & Unlock Report
                  </button>
                </div>
              </details>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
