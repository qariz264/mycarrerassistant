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
  Lock
} from 'lucide-react';
import { StudentAssessment } from '../types';
import { PaystackConfigInfo } from './PaystackConfigModal';

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
        } catch {
          // Response is not JSON
        }
      } catch (readErr: any) {
        rawInitText = readErr?.message || '';
      }

      if (!initRes.ok || !initData?.status) {
        // Fallback: If server-side init fails or returns error, check if a usable public key is available
        const envPublicKey = (typeof import.meta !== 'undefined' && import.meta.env && ((import.meta.env as any).VITE_PAYSTACK_PUBLIC_KEY || (import.meta.env as any).VITE_PAYSTACK_KEY)) || '';
        const fallbackPublicKey = initData?.publicKey || paystackConfig?.publicKey || envPublicKey;
        if (fallbackPublicKey && fallbackPublicKey.startsWith('pk_')) {
          const activeRef = `CAKE_${assessment.id.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
          setCurrentReference(activeRef);
          try {
            localStorage.setItem('career_assistant_ke_active_ref', activeRef);
            localStorage.setItem('career_assistant_ke_active_id', assessment.id);
            localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(assessment));
          } catch (_) {}

          const scriptReady = await ensurePaystackLoaded();
          if (scriptReady && window.PaystackPop) {
            setVerificationStage('awaiting_payment');
            setIsProcessing(false);

            const handler = window.PaystackPop.setup({
              key: fallbackPublicKey,
              email: customerEmail,
              amount: 10000,
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
          'Payment service is currently unavailable. If you just added PAYSTACK_SECRET_KEY in Vercel, please trigger a Redeploy on Vercel so the environment variables take effect.';
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
        setVerificationStage('success');

        // Fetch or use unlocked assessment
        let fullAssessment = verifyData.assessment;
        if (!fullAssessment) {
          const fullRes = await fetch(`/api/assessments/${assessment.id}`);
          fullAssessment = await safeParseJson<any>(fullRes);
        }

        const confirmed: StudentAssessment = fullAssessment || {
          ...assessment,
          paymentStatus: 'PAID',
          isUnlocked: true,
          paidAmount: 100,
          paidAt: new Date().toISOString(),
          paymentReference: targetRef,
        };

        // Cache unlocked report locally
        try {
          localStorage.setItem('career_assistant_ke_active_data', JSON.stringify(confirmed));
        } catch (_) {}

        setTimeout(() => {
          onPaymentSuccess(confirmed);
        }, 600);
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
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 sm:p-7 text-slate-900 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          disabled={isProcessing && verificationStage === 'verifying_server'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Checkout Header */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
          Proceed to Pay
        </h2>

        {/* Amount Display */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <span className="text-2xl font-bold text-slate-900 font-mono">KSh 100</span>
        </div>

        {/* STAGES */}
        {verificationStage === 'verifying_server' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-900">Verifying Payment...</div>
            <div className="text-xs text-slate-500">Checking status with payment network</div>
          </div>
        )}

        {verificationStage === 'success' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-base font-bold text-slate-900">Payment Verified Successfully!</div>
            <div className="text-xs text-slate-500">Opening your complete career report now...</div>
          </div>
        )}

        {verificationStage !== 'verifying_server' && verificationStage !== 'success' && (
          <div className="space-y-4">
            
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Action buttons when verification failed */}
            {verificationStage === 'failed' && (
              <div className="space-y-2 pt-1">
                <div className="flex flex-col gap-2">
                  {authUrl ? (
                    <a
                      href={authUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center cursor-pointer"
                    >
                      <span>Complete Payment (Open Window)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleInitiatePaystack}
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Click to Pay KSh 100</span>
                    </button>
                  )}

                  {currentReference && (
                    <button
                      type="button"
                      onClick={() => handleVerifyOnServer(currentReference)}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>I Have Completed Payment — Verify Status</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setVerificationStage('idle');
                    }}
                    className="w-full py-2 px-4 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
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

            {/* Email & Phone input fields for initial checkout */}
            {verificationStage === 'idle' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address (For payment receipt)
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                  />
                </div>

                {/* Primary Pay Button */}
                <button
                  type="button"
                  onClick={handleInitiatePaystack}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Proceed to Pay KSh 100</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}

            {/* Awaiting Payment / Verification Trigger */}
            {verificationStage === 'awaiting_payment' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs text-sky-700 font-semibold">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span>Payment Initialized</span>
                </div>

                {authUrl ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Complete your payment. If the payment window was closed, click below:
                    </p>
                    <a
                      href={authUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center justify-center gap-1.5 shadow-sm text-center cursor-pointer"
                    >
                      <span>Open Payment Window</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Payment reference: <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded border border-slate-200 font-mono">{currentReference}</code>
                  </p>
                )}
                
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyOnServer(currentReference)}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Completed Payment — Verify Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationStage('idle')}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel or Change Details
                  </button>
                </div>
              </div>
            )}

            {/* Manual reference verification option if needed */}
            <div className="pt-1">
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer hover:text-slate-800 font-medium">
                  Already completed payment on another device? Enter reference
                </summary>
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    placeholder="e.g. CAKE_... or reference code"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyOnServer(manualReference)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg font-medium text-xs cursor-pointer"
                  >
                    Verify Reference
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
