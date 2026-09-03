'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import {
  Loader2,
  Laptop,
  Smartphone,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldCheck,
  Lock,
  KeyRound,
  LogOut,
  Info,
} from 'lucide-react';

interface SessionItem {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

type Feedback = { type: 'success' | 'error'; text: string } | null;

function parseUserAgent(ua?: string | null) {
  if (!ua) return { label: 'Unknown device', isMobile: false, browser: 'Web Browser' };

  const isMobile = /mobile|android|iphone/i.test(ua);

  let browser = 'Web Browser';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua) && !/opr\//i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opr\//i.test(ua)) browser = 'Opera';

  let os = '';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { label: os ? `${browser} on ${os}` : browser, isMobile, browser };
}

function getPasswordStrength(pw: string) {
  if (!pw) return { score: 0, label: '', checks: { length: false, upper: false, number: false, symbol: false } };
  
  const checks = {
    length: pw.length >= 8,
    upper: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };

  let score = 0;
  if (checks.length) score++;
  if (pw.length >= 12) score++;
  if (checks.number) score++;
  if (checks.upper) score++;
  if (checks.symbol) score++;

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];
  const idx = Math.max(0, Math.min(score - 1, labels.length - 1));
  return { score, label: pw.length > 0 ? labels[idx] : '', color: colors[idx], checks };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'object' && err && 'message' in err) {
    return String((err as any).message) || fallback;
  }
  return fallback;
}

export default function SecuritySettingsPage() {
  const { data: currentSessionData } = authClient.useSession();
  const currentToken = currentSessionData?.session?.token;

  const [hasPassword, setHasPassword] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Feedback>(null);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmitPassword =
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    (!hasPassword || currentPassword.length > 0) &&
    !passwordLoading;

  // Sessions State
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      setSessionsError(null);
      const res = await authClient.listSessions();
      if (res.data) {
        const list = res.data as unknown as SessionItem[];
        const sorted = [...list].sort((a, b) => {
          if (a.token === currentToken) return -1;
          if (b.token === currentToken) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setSessions(sorted);
      }
    } catch (err) {
      setSessionsError(getErrorMessage(err, 'Could not load active sessions.'));
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    const checkAccounts = async () => {
      try {
        setAccountsLoading(true);
        const { data } = await authClient.listAccounts();
        const credentialAccount = data?.some((acc: any) => acc.providerId === 'credential');
        setHasPassword(Boolean(credentialAccount));
      } catch (err) {
        console.error('Failed to check accounts:', err);
      } finally {
        setAccountsLoading(false);
      }
    };
    checkAccounts();
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentToken]);

  useEffect(() => {
    if (!passwordMessage) return;
    const t = setTimeout(() => setPasswordMessage(null), 5000);
    return () => clearTimeout(t);
  }, [passwordMessage]);

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitPassword) return;

    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      if (hasPassword) {
        const res = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        });
        if (res.error) {
          setPasswordMessage({ type: 'error', text: res.error.message || 'Operation failed.' });
          return;
        }
      } else {
        const res = await fetch('/api/set-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          setPasswordMessage({
            type: 'error',
            text: json.error?.message || 'Operation failed.',
          });
          return;
        }
      }

      setPasswordMessage({
        type: 'success',
        text: hasPassword
          ? 'Password changed successfully! Other devices have been signed out.'
          : 'Password set successfully! You can now sign in with email & password.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setHasPassword(true);
      loadSessions();
    } catch (err) {
      setPasswordMessage({ type: 'error', text: getErrorMessage(err, 'Something went wrong.') });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRevokeSession = async (token: string) => {
    setRevokingId(token);
    try {
      await authClient.revokeSession({ token });
      setSessions((prev) => prev.filter((s) => s.token !== token));
    } catch (err) {
      setSessionsError(getErrorMessage(err, 'Could not revoke session.'));
    } finally {
      setRevokingId(null);
      setConfirmingId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    setRevokingAll(true);
    try {
      await authClient.revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.token === currentToken));
    } catch (err) {
      setSessionsError(getErrorMessage(err, 'Could not sign out other devices.'));
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessionsCount = sessions.filter((s) => s.token !== currentToken).length;

  return (
    <div className="space-y-10">
      {/* 1. Password Section */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            {hasPassword ? 'Update Password' : 'Set Account Password'}
          </h2>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Security Credentials
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1 mb-6">
          {hasPassword
            ? 'Ensure your account uses a strong, unique password to prevent unauthorized access.'
            : 'You authenticated with an external provider. Add a password for direct email sign-in.'}
        </p>

        {passwordMessage && (
          <div
            role="status"
            className={`p-3.5 mb-6 text-sm rounded-xl border flex items-center gap-2.5 transition-all animate-in fade-in ${
              passwordMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmitPassword} className="space-y-5 max-w-xl" noValidate>
          {accountsLoading ? (
            <div className="flex items-center text-zinc-400 text-xs py-3 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Verifying authentication methods...</span>
            </div>
          ) : hasPassword ? (
            <div>
              <label htmlFor="currentPassword" className="block text-xs font-medium text-zinc-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 bg-zinc-950/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                You currently log in using an external provider (like Google). Set a custom password below to unlock traditional email & password access.
              </span>
            </div>
          )}

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-xs font-medium text-zinc-300 mb-2">
              {hasPassword ? 'New Password' : 'Create Password'}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-11 py-2.5 bg-zinc-950/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter Bar */}
            {newPassword.length > 0 && (
              <div className="mt-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Strength: <span className="text-zinc-200 font-medium">{strength.label}</span></span>
                  <span className="text-zinc-500 text-[10px]">Min. 8 characters</span>
                </div>
                <div className="flex gap-1.5 h-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        i < strength.score ? strength.color : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-zinc-300 mb-2">
              Confirm {hasPassword ? 'New ' : ''}Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                autoComplete="new-password"
                className={`w-full pl-10 pr-11 py-2.5 bg-zinc-950/40 border rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none transition ${
                  passwordsMismatch
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-white/10 focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Passwords do not match
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmitPassword}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dull text-white text-sm font-medium rounded-xl transition shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {hasPassword ? 'Update Password' : 'Set Password'}
            </button>
          </div>
        </form>
      </div>

      <hr className="border-white/[0.08]" />

      {/* 2. Active Sessions */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white tracking-tight">Active Devices & Sessions</h2>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                {sessions.length} {sessions.length === 1 ? 'Device' : 'Devices'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Browsers and mobile platforms currently authenticated with your CineVerse account.
            </p>
          </div>

          {otherSessionsCount > 0 && (
            <button
              onClick={handleRevokeAllOthers}
              disabled={revokingAll}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-400 border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0 w-fit"
            >
              {revokingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              Sign Out All Other Devices
            </button>
          )}
        </div>

        {sessionsError && (
          <div className="p-3.5 mb-4 text-xs rounded-xl border bg-red-500/10 border-red-500/30 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{sessionsError}</span>
          </div>
        )}

        <div className="space-y-3">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-10 text-zinc-500 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Scanning authenticated sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4">No active sessions located.</p>
          ) : (
            sessions.map((sess) => {
              const { label, isMobile } = parseUserAgent(sess.userAgent);
              const isCurrent = sess.token === currentToken;
              const isConfirming = confirmingId === sess.id;
              const isRevoking = revokingId === sess.token;

              return (
                <div
                  key={sess.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-zinc-950/60 border-primary/40 shadow-lg shadow-primary/5'
                      : 'bg-zinc-950/30 border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        isCurrent
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                      }`}
                    >
                      {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{label}</p>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            This Device
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        IP: {sess.ipAddress || '127.0.0.1'} • Logged in {formatDate(sess.createdAt)}
                      </p>
                    </div>
                  </div>

                  {isCurrent ? (
                    <span className="text-[11px] text-zinc-500 font-medium px-2 py-1 rounded-md bg-white/[0.02] shrink-0 border border-white/5">
                      Current
                    </span>
                  ) : isConfirming ? (
                    <div className="flex items-center gap-1.5 shrink-0 bg-zinc-900/80 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => handleRevokeSession(sess.token)}
                        disabled={isRevoking}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition cursor-pointer disabled:opacity-50"
                        title="Confirm Revocation"
                      >
                        {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        disabled={isRevoking}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(sess.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer shrink-0"
                      title="Revoke session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}