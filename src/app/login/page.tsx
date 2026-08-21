'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

import { loginSchema as schema } from '@/lib/validations';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  
  const [error, setError] = useState(
    errorParam === 'GoogleAuthFailed' ? 'Google Authentication failed. Please try again.' :
    errorParam === 'AccountBlocked' ? 'Your account is banned or deleted.' : ''
  );
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: joiResolver(schema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setError('');
      await axios.post('/api/auth/login', data);
      router.push('/workshops');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
          <h1 className="text-5xl font-heading font-bold mb-4">Welcome back to Coltask.</h1>
          <p className="text-xl text-white/60">Secure, encrypted agile management for professional teams.</p>
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
            <h2 className="text-3xl font-heading font-bold text-center md:text-left mb-8">Log In</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 border border-red-100 flex items-center justify-center md:justify-start">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('email')}
                />
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
                <div className="mt-2 text-right">
                  <Link href="/forgot-password" className="text-sm text-black/60 hover:text-black font-medium transition-colors">Forgot password?</Link>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10"></div>
              </div>
              <div className="relative flex justify-center text-sm md:justify-start">
                <span className="px-4 bg-[#fdfdfc] text-black/40 font-medium">OR</span>
              </div>
            </div>

            <a 
              href="/api/auth/google"
              className="w-full bg-white text-black border border-black/20 py-3.5 rounded-xl font-medium hover:bg-black/5 transition-colors flex items-center justify-center gap-3 mb-6"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              Continue with Google
            </a>

            <p className="text-center md:text-left text-sm font-medium text-black/60">
              Don't have an account?{' '}
              <Link href="/register" className="text-black hover:underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
