import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Copy, 
  Sparkles,
  CreditCard,
  Smartphone
} from 'lucide-react';

export interface PaystackConfigInfo {
  publicKey: string;
  maskedSecretKey: string;
  isConfigured: boolean;
  isTest: boolean;
  isLive: boolean;
  source: 'custom' | 'env' | 'demo';
}

interface PaystackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: (config: PaystackConfigInfo) => void;
}

export const PaystackConfigModal: React.FC<PaystackConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<PaystackConfigInfo | null>(null);
  const [publicKeyInput, setPublicKeyInput] = useState('');
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [canForceSave, setCanForceSave] = useState(false);

  // Fetch current config when opened
  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/paystack/config');
      if (res.ok) {
        const data: PaystackConfigInfo = await res.json();
        setConfig(data);
        if (data.source === 'custom' || data.source === 'env') {
          setPublicKeyInput(data.publicKey);
        }
      }
    } catch (err) {
      console.error('Failed to load Paystack config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      setMessage(null);
      setCanForceSave(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    if (!publicKeyInput.trim() || !secretKeyInput.trim()) {
      setMessage({
        type: 'error',
        text: 'Both Paystack Public Key (pk_test_...) and Secret Key (sk_test_...) are required.',
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/paystack/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: publicKeyInput.trim(),
          secretKey: secretKeyInput.trim(),
          force,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.canForce) {
          setCanForceSave(true);
        }
        throw new Error(data.error || 'Failed to save Paystack keys.');
      }

      setCanForceSave(false);
      setMessage({
        type: 'success',
        text: data.message || 'Paystack test keys saved and verified successfully!',
      });

      // Refresh config state
      const updatedConfig: PaystackConfigInfo = {
        publicKey: data.publicKey,
        maskedSecretKey: data.maskedSecretKey,
        isConfigured: data.isConfigured,
        isTest: data.isTest,
        isLive: data.isLive,
        source: data.source,
      };
      setConfig(updatedConfig);
      setSecretKeyInput(''); // Clear plain text input for safety
      if (onConfigUpdated) onConfigUpdated(updatedConfig);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Error updating keys. Please check that your key format is correct.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset Paystack keys to default sandbox demo mode?')) return;
    setIsResetting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/paystack/config/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Reset to default sandbox demo.',
        });
        setPublicKeyInput('');
        setSecretKeyInput('');
        await fetchConfig();
        if (onConfigUpdated && config) {
          onConfigUpdated({
            ...config,
            isConfigured: false,
            source: 'demo',
          });
        }
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: 'Failed to reset configuration.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Paystack API Key Settings</h3>
              <p className="text-xs text-slate-500">Connect your Paystack keys (Live or Test) for KSh 100 assessment unlock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500">Current Status: </span>
            {config?.isConfigured ? (
              <span className="font-semibold text-emerald-700">
                {config.isTest ? '● Custom Test Key Active' : '● Live Key Active'}
              </span>
            ) : (
              <span className="font-semibold text-sky-700">
                ● Sandbox Simulator Active
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Source: <span className="text-slate-700 font-medium">{config?.source || (isLoading ? 'loading...' : 'demo')}</span>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed font-medium">{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Paystack Public Key (starts with <code className="text-sky-700 font-mono">pk_live_</code> or <code className="text-sky-700 font-mono">pk_test_</code>)
              </label>
              <a
                href="https://dashboard.paystack.com/#/settings/developer"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-600 hover:text-sky-800 flex items-center gap-1 underline font-medium"
              >
                <span>Paystack Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              value={publicKeyInput}
              onChange={(e) => setPublicKeyInput(e.target.value)}
              placeholder="pk_live_... or pk_test_..."
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Paystack Secret Key (starts with <code className="text-sky-700 font-mono">sk_live_</code> or <code className="text-sky-700 font-mono">sk_test_</code>)
              </label>
              <span className="text-[11px] text-slate-500">
                {config?.maskedSecretKey && config.isConfigured ? `Current: ${config.maskedSecretKey}` : 'Needed for server verification'}
              </span>
            </div>
            <div className="relative">
              <input
                type={showSecretKey ? 'text' : 'password'}
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                placeholder="sk_live_... or sk_test_..."
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating & Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Apply Keys</span>
                </>
              )}
            </button>

            {config?.isConfigured && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="py-2.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset to Sandbox
              </button>
            )}
          </div>

          {canForceSave && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => handleSave(undefined, true)}
                disabled={isSaving}
                className="text-xs text-amber-700 hover:text-amber-800 underline font-medium cursor-pointer"
              >
                Save anyway (bypass Paystack online validation)
              </button>
            </div>
          )}
        </form>

        {/* Quick Testing Reference Box */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Paystack Test Credentials Helper</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Card Info */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold mb-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Card (Success)</span>
              </div>
              <div className="font-mono text-[11px] text-slate-700 flex items-center justify-between">
                <span>4084 0840 0840 0840</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('4084084008400840', 'card')}
                  className="text-sky-600 hover:underline flex items-center gap-1 font-sans font-medium cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedText === 'card' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                CVV: <code className="text-slate-700">408</code> · Exp: <code className="text-slate-700">12/30</code> · OTP: <code className="text-slate-700">123456</code>
              </div>
            </div>

            {/* Mobile Money / M-Pesa Info */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold mb-1">
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span>Test Mobile Money</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Enter any valid phone number (e.g. <code className="text-slate-800 font-mono">0712345678</code>) in Paystack test mode.
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Keys are stored securely in your server environment and data folder. No live customer cards are charged when using <code className="text-slate-700 font-mono">pk_test_</code> and <code className="text-slate-700 font-mono">sk_test_</code> keys.
          </p>
        </div>

      </div>
    </div>
  );
};
