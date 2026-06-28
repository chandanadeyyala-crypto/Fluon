import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  auth, 
  googleProvider 
} from '../lib/firebase';
import { Sparkles, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

interface AuthViewProps {
  isDark: boolean;
  onDemoBypass?: () => void;
}

export default function AuthView({ isDark, onDemoBypass }: AuthViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error("Display Name is required.");
        }
        await createUserWithEmailAndPassword(auth, email, password);
        // Let user know their account was created
        setMessage("Account created successfully! Welcome to Fluon.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Authentication failed.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google Sign-In failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
      isDark ? 'bg-[#000000] text-white' : 'bg-[#F2FFFF] text-black'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-2xl border transition-all duration-300 ${
        isDark 
          ? 'bg-[#111] border-white/10 shadow-2xl shadow-indigo-500/5' 
          : 'bg-white border-black/10 shadow-lg'
      }`}>
        {/* Header and Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            isDark ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            <div className={`w-4 h-4 border-2 rotate-45 ${
              isDark ? 'border-black' : 'border-white'
            }`}></div>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">Fluon</h1>
          <p className="text-xs opacity-60 text-center font-medium max-w-[260px]">
            Your Stress-Aware Cognitive Task & Productivity System
          </p>
        </div>

        {/* Dynamic Status Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Display Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 opacity-40" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-xs rounded-lg border focus:outline-none transition-all ${
                    isDark 
                      ? 'bg-neutral-900 border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-neutral-50 border-black/10 text-black focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 opacity-40" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-lg border focus:outline-none transition-all ${
                  isDark 
                    ? 'bg-neutral-900 border-white/10 text-white focus:border-indigo-500' 
                    : 'bg-neutral-50 border-black/10 text-black focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] text-indigo-400 hover:underline font-semibold"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 opacity-40" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-lg border focus:outline-none transition-all ${
                  isDark 
                    ? 'bg-neutral-900 border-white/10 text-white focus:border-indigo-500' 
                    : 'bg-neutral-50 border-black/10 text-black focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              isDark 
                ? 'bg-white text-black hover:opacity-90' 
                : 'bg-black text-white hover:opacity-90'
            } disabled:opacity-50`}
          >
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-neutral-500/10"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest opacity-40">or</span>
          <div className="flex-grow border-t border-neutral-500/10"></div>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
            isDark 
              ? 'bg-neutral-900 border-white/10 hover:bg-neutral-800 text-white' 
              : 'bg-white border-black/10 hover:bg-neutral-50 text-black'
          } disabled:opacity-50`}
        >
          {/* Simple Vector Google Icon */}
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.97 1 12 1 7.35 1 3.37 3.65 1.48 7.5l3.85 3C6.26 7.42 8.92 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.88c2.18-2.01 3.7-4.98 3.7-8.61z"
            />
            <path
              fill="#FBBC05"
              d="M5.33 14.24c-.25-.74-.39-1.53-.39-2.36s.14-1.62.39-2.36l-3.85-3C.68 8.04 0 9.94 0 12s.68 3.96 1.48 5.48l3.85-3.24z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.88c-1.1.74-2.5 1.18-4.23 1.18-3.08 0-5.74-2.38-6.67-5.46l-3.85 3C3.37 20.35 7.35 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Continue Demo Bypass */}
        {onDemoBypass && (
          <div className="mt-4 flex flex-col items-center">
            <button
              type="button"
              onClick={onDemoBypass}
              className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                isDark 
                  ? 'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/25 text-indigo-200 shadow-sm' 
                  : 'bg-indigo-50/50 border-indigo-200/60 hover:bg-indigo-100/50 text-indigo-700 shadow-sm'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
              <span>Explore as Guest</span>
            </button>
            <p className="text-[9px] mt-1.5 font-mono uppercase tracking-wider opacity-50">
              Preview the app instantly
            </p>
          </div>
        )}

        {/* Toggle mode link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-[10px] uppercase tracking-wider font-bold opacity-60 hover:opacity-100 transition-all hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
