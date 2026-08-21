'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Mail, Search, Pencil } from 'lucide-react';

const inviteSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  role: Joi.string().valid('admin', 'member').default('member'),
});
type InviteInputs = {
  email: string;
  role: 'admin' | 'member';
};
  
export default function TeamManagement({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset } = useForm<InviteInputs>({
    resolver: joiResolver(inviteSchema),
    defaultValues: { role: 'member' }
  });

  const fetchWorkshop = async () => {
    try {
      const res = await axios.get(`/api/workshops/${id}`);
      setWorkshop(res.data.workshop);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshop();
  }, [id]);

  const onSubmitInvite = async (data: InviteInputs) => {
    try {
      await axios.post(`/api/workshops/${id}/members`, data);
      reset();
      fetchWorkshop();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to invite member');
    }
  };

  if (loading) return <div className="loading loading-spinner text-primary mx-auto mt-20 block"></div>;
  if (!workshop) return <div>Workshop not found</div>;

  const filteredMembers = workshop.members?.filter((m: any) => {
    if (filter === 'ALL') return true;
    if (filter === 'PRODUCT OWNER' && m.role === 'admin') return true;
    if (filter === 'BACK' && m.role === 'member') return true;
    return false;
  }) || [];

  return (
    <div className="flex h-full bg-white text-[#354052]">
      {/* Left Sidebar Filters */}
      <div className="w-64 border-r border-base-200 p-6 shrink-0 h-full">
        <h2 className="text-xl font-bold text-[#0092d1] mb-6">Filters</h2>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-base-content/40" />
          <input type="text" placeholder="Search by full name..." className="input input-sm input-bordered w-full pl-9 rounded-sm" />
        </div>
        <ul className="space-y-4 font-semibold text-sm uppercase tracking-wide">
          <li>
            <button 
              className={`w-full text-left flex justify-between ${filter === 'ALL' ? 'text-[#0092d1]' : 'text-base-content/70 hover:text-[#0092d1]'}`}
              onClick={() => setFilter('ALL')}
            >
              ALL <span className="font-bold">{filter === 'ALL' ? '>' : ''}</span>
            </button>
          </li>
          <li className="pt-4 border-t border-base-200">
            <button 
              className={`w-full text-left flex justify-between ${filter === 'BACK' ? 'text-[#0092d1]' : 'text-base-content/70 hover:text-[#0092d1]'}`}
              onClick={() => setFilter('BACK')}
            >
              BACK <span className="font-bold">{filter === 'BACK' ? '>' : ''}</span>
            </button>
          </li>
          <li className="pt-4 border-t border-base-200">
            <button 
              className={`w-full text-left flex justify-between ${filter === 'PRODUCT OWNER' ? 'text-[#0092d1]' : 'text-base-content/70 hover:text-[#0092d1]'}`}
              onClick={() => setFilter('PRODUCT OWNER')}
            >
              PRODUCT OWNER <span className="font-bold">{filter === 'PRODUCT OWNER' ? '>' : ''}</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Main Team Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-base-200">
          <h1 className="text-2xl font-bold text-[#0092d1]">Team <span className="text-base-content/50 font-normal">{filter === 'ALL' ? '' : `> ${filter}`}</span></h1>
          
          <form onSubmit={handleSubmit(onSubmitInvite)} className="flex gap-2 items-center bg-base-100 p-2 rounded-sm border border-base-200 shadow-sm">
             <Mail size={16} className="text-base-content/50 ml-2" />
             <input type="email" placeholder="Invite by email" className="input input-sm input-ghost focus:outline-none w-48" required {...register('email')} />
             <select className="select select-sm select-ghost text-xs" {...register('role')}>
               <option value="member">Member</option>
               <option value="admin">Product Owner</option>
             </select>
             <button type="submit" className="btn btn-sm btn-[#47d2b2] text-white border-none rounded-sm px-4">INVITE</button>
          </form>
        </div>

        <div className="flex items-center mb-4 text-xs font-bold uppercase tracking-wider text-[#354052]/70">
           <div>User</div>
        </div>

        <div className="space-y-4">
          {filteredMembers.map((member: any) => (
            <div key={member.id} className="flex gap-4 items-center py-4 border-b border-base-200 hover:bg-base-50 transition-colors">
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded flex items-center justify-center text-white font-bold text-xl ${member.role === 'admin' ? 'bg-[#9fb7a2]' : 'bg-[#e2a2a7]'}`}>
                  {member.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-bold text-[#354052]">{member.user.name}</div>
                  <div className="text-xs text-base-content/50">{member.role === 'admin' ? 'Product Owner' : 'Back'}</div>
                </div>
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
             <div className="py-8 text-center text-base-content/50">No members found matching the filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
