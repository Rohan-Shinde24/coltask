'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess('If an account with that email exists, we have sent a reset OTP. Please check your console (for now).');
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
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
          <h1 className="text-5xl font-heading font-bold mb-4">Reset your password.</h1>
          <p className="text-xl text-white/60">Regain access to your secure workspace.</p>
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
            <h2 className="text-3xl font-heading font-bold text-center md:text-left mb-4">Forgot Password</h2>
            <p className="text-black/60 text-sm text-center md:text-left mb-8">
              Enter your email address and we'll send you a 6-digit OTP to reset your password.
            </p>
            
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
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting || success !== ''}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset OTP'}
              </button>
            </form>

            <div className="mt-8 text-center md:text-left text-sm font-medium text-black/60">
              Remember your password?{' '}
              <Link href="/login" className="text-black hover:underline underline-offset-4">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
