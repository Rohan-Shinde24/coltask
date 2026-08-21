'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';

// Local schema for client validation (matches backend)
const createWorkshopSchema = Joi.object({
  name: Joi.string().max(50).required().messages({
    'string.empty': 'Workshop name is required',
  }),
  description: Joi.string().max(500).allow(''),
});
type CreateWorkshopInputs = { name: string; description?: string };

export default function Workshops() {
  const router = useRouter();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkshopInputs>({
    resolver: joiResolver(createWorkshopSchema),
  });

  const fetchData = async () => {
    try {
      const [wsRes, meRes] = await Promise.all([
        axios.get('/api/workshops'),
        axios.get('/api/auth/me')
      ]);
      setWorkshops(wsRes.data.workshops);
      setCurrentUser(meRes.data.user);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const onSubmitCreate = async (data: CreateWorkshopInputs) => {
    try {
      setError('');
      await axios.post('/api/workshops', data);
      setIsModalOpen(false);
      reset();
      fetchData(); // refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    setError('');
    
    try {
      const res = await axios.post('/api/workshops/join', { code: joinCode.trim() });
      setIsJoinModalOpen(false);
      setJoinCode('');
      router.push(`/workshops/${res.data.workshopId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join workshop');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <header className="navbar bg-base-100 shadow-sm px-4 border-b border-base-200">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl font-bold">ColTask</Link>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder overflow-hidden">
              {currentUser?.avatarUrl ? (
                <div className="w-10 rounded-full">
                  <img src={currentUser.avatarUrl} alt="Avatar" />
                </div>
              ) : (
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span className="text-sm">{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
              )}
            </div>
            <ul tabIndex={0} className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title px-4 py-2 opacity-50 font-bold">{currentUser?.name || 'User'}</li>
              <li><Link href="/settings">Settings & Profile</Link></li>
              <li><button onClick={handleLogout} className="text-error flex gap-2 mt-2"><LogOut size={16} /> Logout</button></li>
            </ul>
          </div>
        </div>
      </header>

      <main className="grow p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Workshops</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setIsJoinModalOpen(true)}>
              Join with Code
            </Button>
            <Button variant="primary" leftIcon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
              New Workshop
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((ws) => (
            <Link href={`/workshops/${ws.id}`} key={ws.id} className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow cursor-pointer">
              <div className="card-body">
                <h2 className="card-title truncate">{ws.name}</h2>
                <p className="text-sm text-base-content/70 mb-4 line-clamp-2">{ws.description || 'No description'}</p>
                <div className="card-actions justify-between items-center mt-2">
                  <div className="text-xs text-base-content/50">{ws.members?.length || 0} Members</div>
                  <button className="btn btn-circle btn-sm btn-ghost">
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
          
          <div 
            className="card bg-base-100 border border-base-300 border-dashed hover:border-primary transition-colors cursor-pointer flex items-center justify-center min-h-50"
            onClick={() => setIsModalOpen(true)}
          >
             <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-base-content/50" />
                </div>
                <h3 className="font-medium">Create New Workshop</h3>
                <p className="text-xs text-base-content/50 mt-1">Start a new project space</p>
             </div>
          </div>
        </div>
      </main>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(''); }} title="Create New Workshop">
        {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Workshop Name</span></label>
            <input 
              type="text" 
              className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`} 
              {...register('name')} 
            />
            {errors.name && <span className="text-error text-xs mt-1">{errors.name.message}</span>}
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Description (Optional)</span></label>
            <textarea 
              className="textarea textarea-bordered w-full" 
              rows={3} 
              {...register('description')} 
            ></textarea>
          </div>
          <div className="modal-action">
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setError(''); }}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Modal */}
      <Modal isOpen={isJoinModalOpen} onClose={() => { setIsJoinModalOpen(false); setError(''); setJoinCode(''); }} title="Join Workshop">
        {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
        
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Workshop Join Code</span></label>
            <input 
              type="text" 
              placeholder="e.g. A1B2C3"
              className="input input-bordered w-full uppercase font-mono tracking-widest" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="modal-action">
            <Button type="button" variant="ghost" onClick={() => { setIsJoinModalOpen(false); setError(''); setJoinCode(''); }}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isJoining} disabled={!joinCode.trim()}>
              Join Workshop
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
