'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft, Check, User as UserIcon } from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Molly',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Peanut',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bandit',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Snowball',
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setName(res.data.user.name || '');
      setSelectedAvatar(res.data.user.avatarUrl || null);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.patch('/api/users/profile', {
        name,
        avatarUrl: selectedAvatar,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Force a soft refresh to update layout components if needed
      router.refresh();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfc]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfc] text-black font-sans selection:bg-black selection:text-white pb-20">
      {/* Header */}
      <div className="border-b border-black/5 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/workshops" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-heading font-bold">Account Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden">
          <div className="p-8 sm:p-12">
            <h2 className="text-xl font-bold mb-6">Profile Details</h2>
            
            {message.text && (
              <div className={`px-4 py-3 rounded-xl text-sm mb-8 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {message.type === 'success' && <Check size={16} />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-10">
              
              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-semibold mb-4">Choose an Avatar</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                  {/* Option for NO avatar */}
                  <div 
                    onClick={() => setSelectedAvatar(null)}
                    className={`relative cursor-pointer aspect-square rounded-full border-2 transition-all flex items-center justify-center bg-black/5 ${selectedAvatar === null ? 'border-black scale-110 shadow-lg' : 'border-transparent hover:border-black/30 opacity-70'}`}
                  >
                    <UserIcon size={24} className="text-black/40" />
                    {selectedAvatar === null && (
                      <div className="absolute -bottom-1 -right-1 bg-black text-white p-1 rounded-full border-2 border-white">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </div>

                  {/* Predefined Avatars */}
                  {AVATAR_OPTIONS.map((url, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative cursor-pointer aspect-square rounded-full border-2 transition-all overflow-hidden bg-black/5 ${selectedAvatar === url ? 'border-black scale-110 shadow-lg' : 'border-transparent hover:border-black/30 opacity-70'}`}
                    >
                      <img src={url} alt={`Avatar ${idx + 1}`} className="object-cover w-full h-full" />
                      {selectedAvatar === url && (
                        <div className="absolute -bottom-1 -right-1 bg-black text-white p-1 rounded-full border-2 border-white z-10">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="max-w-md">
                <label className="block text-sm font-semibold mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  required
                />
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-black/5 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
