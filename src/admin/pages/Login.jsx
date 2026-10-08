import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, MailCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { authApi, errorMessage } from '../api/client';
import { FullPageLoader } from '../components/ProtectedRoute';

const CODE_LENGTH = 6;

export default function Login() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const codeRef = useRef(null);

  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    if (!resendAt) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [resendAt]);

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'authenticated') return <Navigate to={location.state?.from || '/admin'} replace />;

  const sendCode = async () => {
    setError('');
    setBusy(true);
    try {
      const data = await authApi.requestCode(email.trim());
      const start = Date.now();
      setNow(start);
      setResendAt(start + (data.resendAfter || 60) * 1000);
      setNotice(`If ${email.trim()} has access, a ${CODE_LENGTH}-digit code is on its way. It expires in ${data.expiresInMinutes || 10} minutes.`);
      setCode('');
      setStep('code');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value = code) => {
    if (value.length !== CODE_LENGTH || busy) return;
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), value);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setCode('');
      codeRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const onCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(value);
    if (value.length === CODE_LENGTH) verify(value);
  };

  const backToEmail = () => {
    setStep('email');
    setError('');
    setCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft px-4">
      <div className="w-full max-w-sm bg-surface border border-theme rounded-2xl shadow-clean p-8">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primaryGreen/10 text-primaryGreen flex items-center justify-center mb-3">
            {step === 'email' ? <Lock className="w-5 h-5" /> : <MailCheck className="w-5 h-5" />}
          </div>
          <h1 className="text-xl font-semibold text-body">{step === 'email' ? 'Research Patra Admin' : 'Check your email'}</h1>
          <p className="text-sm text-muted mt-1">
            {step === 'email' ? 'Sign in with a one-time code' : notice}
          </p>
        </div>

        {step === 'email' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
            className="space-y-4"
          >
            <label className="block">
              <span className="admin-label">Email</span>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
              />
            </label>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={busy || !email.trim()} className="admin-btn-primary w-full">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Send code
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
            className="space-y-4"
          >
            <label className="block">
              <span className="admin-label">{CODE_LENGTH}-digit code</span>
              <input
                ref={codeRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d*"
                maxLength={CODE_LENGTH}
                value={code}
                onChange={onCodeChange}
                readOnly={busy}
                placeholder="••••••"
                className="admin-input text-center text-2xl font-semibold tracking-[0.5em] py-3"
                aria-label="Sign-in code"
              />
            </label>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={busy || code.length !== CODE_LENGTH} className="admin-btn-primary w-full">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={backToEmail} className="inline-flex items-center gap-1 text-muted hover:text-body">
                <ArrowLeft className="w-4 h-4" /> Change email
              </button>
              <button
                type="button"
                onClick={sendCode}
                disabled={busy || secondsLeft > 0}
                className="text-primaryGreen font-medium disabled:text-muted disabled:cursor-not-allowed"
              >
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
