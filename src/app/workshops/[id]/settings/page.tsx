'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const workshopSchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().max(500).allow(''),
  isPrivate: Joi.boolean(),
});
type WorkshopInputs = { name: string; description?: string; isPrivate?: boolean };

export default function WorkshopSettings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('project-details');
  const [tags, setTags] = useState<{name: string, color: string}[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#47d2b2');
  const [isAdmin, setIsAdmin] = useState(false);

  const { register, handleSubmit, reset, getValues } = useForm<WorkshopInputs>({
    resolver: joiResolver(workshopSchema),
  });

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const [meRes, res] = await Promise.all([
          axios.get('/api/auth/me').catch(() => null),
          axios.get(`/api/workshops/${id}`)
        ]);
        const workshopData = res.data.workshop;
        setWorkshop(workshopData);
        setTags(workshopData.tags || []);
        
        const user = meRes?.data?.user;
        const member = workshopData.members?.find((m: any) => m.user?.id === user?.id || m.user === user?.id);
        setIsAdmin(member?.role === 'admin' || member?.role === 'ADMIN');

        reset({
          name: workshopData.name,
          description: workshopData.description || '',
          isPrivate: workshopData.isPrivate ?? true,
        });
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshop();
  }, [id, reset]);

  const onSubmitUpdate = async (data: WorkshopInputs) => {
    try {
      const formattedData = {
        ...data,
        tags: tags,
      };
      await axios.put(`/api/workshops/${id}`, formattedData);
      alert('Project Details saved successfully!');
    } catch (err: any) {
      alert('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`/api/workshops/${id}`);
      router.push('/workshops');
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const saveTagsToDb = async (newTags: typeof tags) => {
    try {
      const currentData = getValues();
      await axios.put(`/api/workshops/${id}`, {
        ...currentData,
        tags: newTags,
      });
    } catch (err) {
      console.error('Failed to save tags automatically', err);
      alert('Failed to save tags');
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const newTags = [...tags, { name: newTagName.trim(), color: newTagColor }];
    setTags(newTags);
    setNewTagName('');
    await saveTagsToDb(newTags);
  };

  const handleRemoveTag = async (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    await saveTagsToDb(newTags);
  };

  if (loading) return <div className="loading loading-spinner text-primary mx-auto mt-20 block"></div>;

  return (
    <div className="flex h-full bg-white text-[#354052]">
      {/* Main Settings Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-base-200">
          <h1 className="text-2xl font-bold text-[#0092d1]">Project details</h1>
          {!isAdmin && <span className="badge badge-warning">View Only - Product Owners can edit</span>}
        </div>
        
        {activeTab === 'project-details' && (
          <form onSubmit={handleSubmit(onSubmitUpdate)} className="max-w-3xl flex gap-8">
            {/* Logo Section */}
            <div className="w-48 shrink-0 flex flex-col gap-4 text-center">
              <div className="w-48 h-48 bg-[#d29b9f] flex items-center justify-center text-white font-bold text-6xl border border-base-300 rounded">
                 {workshop?.name?.charAt(0).toUpperCase()}
              </div>
              {workshop?.joinCode && (
                <div className="p-4 border border-base-200 rounded bg-base-50/50">
                  <div className="text-xs font-bold text-base-content/50 uppercase mb-2">Join Code</div>
                  <div className="text-xl font-mono font-bold tracking-widest text-[#0092d1]">{workshop.joinCode}</div>
                  <div className="text-[10px] text-base-content/40 mt-2">Share this code with team members</div>
                </div>
              )}
            </div>

            {/* Form Section */}
            <div className="flex-1 space-y-6">
              <div className="form-control">
                <label className="label font-bold text-[#354052] text-sm"><span className="label-text">Project name</span></label>
                <input 
                  type="text" 
                  className="input input-bordered input-sm rounded-sm text-[#354052] w-full" 
                  disabled={!isAdmin}
                  {...register('name')} 
                />
              </div>
              
              <div className="form-control">
                <label className="label font-bold text-[#354052] text-sm"><span className="label-text">Description</span></label>
                <textarea 
                  className="textarea textarea-bordered rounded-sm w-full text-[#354052] text-sm p-3 h-32" 
                  disabled={!isAdmin}
                  {...register('description')} 
                ></textarea>
              </div>

              <div>
                <label className="label font-bold text-[#354052] text-sm"><span className="label-text">Tags</span></label>
                <div className="border border-base-200 p-4 rounded-sm mb-2">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, i) => (
                      <span key={i} className="badge badge-lg border-none text-white gap-1 pl-3 pr-1" style={{ backgroundColor: tag.color }}>
                        {tag.name}
                        {isAdmin && (
                          <button type="button" onClick={() => handleRemoveTag(i)} className="btn btn-ghost btn-xs btn-circle text-white/70 hover:text-white">
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))}
                    {tags.length === 0 && <span className="text-sm text-base-content/50 italic">No tags defined.</span>}
                  </div>
                  
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                       <input 
                         type="text" 
                         className="input input-bordered input-sm rounded-sm flex-1" 
                         placeholder="New tag name..." 
                         value={newTagName}
                         onChange={e => setNewTagName(e.target.value)}
                       />
                       <input 
                         type="color" 
                         className="w-8 h-8 p-0 border-0 rounded cursor-pointer" 
                         value={newTagColor}
                         onChange={e => setNewTagColor(e.target.value)}
                       />
                       <Button type="button" size="sm" variant="primary" className="px-4" onClick={handleAddTag} leftIcon={<Plus size={16} />}>
                         Add
                       </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                 <Button type="button" className="flex-1" variant="outline">PUBLIC PROJECT</Button>
                 <Button type="button" className="flex-1" variant="primary">PRIVATE PROJECT</Button>
              </div>

              {isAdmin && (
                <div className="flex justify-end gap-2 mt-8">
                   <Button type="button" size="sm" variant="danger" onClick={handleDelete}>DELETE PROJECT</Button>
                   <Button type="submit" size="sm" variant="success">Save</Button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
