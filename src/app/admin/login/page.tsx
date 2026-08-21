'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setIsLoading(true);
      setError('');
      
      await axios.post('/api/admin/auth/login', { username, password });
      
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <Shield className="text-white" size={32} />
          </div>
          
          <h1 className="text-3xl font-black mb-2 text-black tracking-tight">Admin Portal</h1>
          <p className="text-black/60 mb-8 font-medium">Authorized personnel only.</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-2 border border-red-100">
              <Shield className="mt-0.5 shrink-0" size={16} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-black">Username</label>
              <input
                type="text"
                placeholder="Enter admin username"
                className="w-full px-4 py-3.5 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-black/30"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold mb-2 text-black">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                className="w-full px-4 py-3.5 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-black/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-9.5 text-black/40 hover:text-black transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-4 text-base mt-4 font-bold shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Authenticating...
                </>
              ) : (
                'Secure Login'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
