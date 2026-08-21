'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email is required to resend OTP');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess('A new reset OTP has been sent to your email.');
      setTimeLeft(120); // Reset timer to 2 minutes
      setCanResend(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token || !newPassword) return;

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      await axios.post('/api/auth/reset-password', { email, token, newPassword });
      setSuccess('Your password has been reset successfully. Redirecting to login...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid token or reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfdfc] text-black font-sans relative">
      
      {/* Left Branding Side (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-black text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none opacity-20"></div>
        <div className="relative z-10">
          <Link href="/" className="inline-flex w-12 h-12 bg-white rounded-full items-center justify-center hover:scale-105 transition-transform">
            <span className="text-black font-heading font-bold text-2xl">C</span>
          </Link>
        </div>
        <div className="relative z-10 mb-20">
          <h1 className="text-5xl font-heading font-bold mb-4">Set new password.</h1>
          <p className="text-xl text-white/60">Please enter the 6-digit code sent to your email.</p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative min-h-screen md:min-h-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none md:hidden"></div>
        
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/10 relative z-10 overflow-hidden md:shadow-none md:border-none md:bg-transparent">
          <div className="p-8 sm:p-12 md:p-0">
            <div className="flex justify-center mb-8 md:hidden">
              <Link href="/" className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <span className="text-white font-heading font-bold text-2xl">C</span>
              </Link>
            </div>
            <h2 className="text-3xl font-heading font-bold text-center md:text-left mb-8">Reset Password</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 border border-red-100 flex items-center justify-center md:justify-start">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm mb-6 border border-green-100 flex items-center justify-center md:justify-start">
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!emailParam}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold">6-Digit OTP</label>
                  <span className={`text-xs font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-black/60'}`}>
                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Expired'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-mono tracking-[0.2em] text-center"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || isSubmitting}
                    className={`text-sm font-medium transition-colors ${canResend ? 'text-primary hover:underline' : 'text-black/40 cursor-not-allowed'}`}
                  >
                    Resend OTP {canResend ? '' : `(${formatTime(timeLeft)})`}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all pr-12"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting || success !== ''}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Reset'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
