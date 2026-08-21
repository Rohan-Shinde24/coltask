'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const userStorySchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Subject is required',
  }),
  description: Joi.string().allow('', null).optional(),
  points: Joi.number().min(0).default(0),
  tag: Joi.string().required().messages({
    'string.empty': 'Please select a tag',
  }),
});
type UserStoryInputs = { title: string; description?: string; points?: number; tag: string };

const sprintSchema = Joi.object({
  name: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
});
type SprintInputs = { name: string; startDate: string; endDate: string };

export default function Backlog({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [userStories, setUserStories] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [workshopTags, setWorkshopTags] = useState<{name: string, color: string}[]>([]);
  const [workshopName, setWorkshopName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [isUsModalOpen, setIsUsModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isEditUsModalOpen, setIsEditUsModalOpen] = useState(false);
  const [editingUs, setEditingUs] = useState<any>(null);
  
  const [error, setError] = useState('');

  const { register: registerUs, handleSubmit: handleSubmitUs, reset: resetUs, formState: { errors: usErrors, isSubmitting: isSubmittingUs } } = useForm<UserStoryInputs>({
    resolver: joiResolver(userStorySchema),
  });

  const { register: registerEditUs, handleSubmit: handleSubmitEditUs, reset: resetEditUs, formState: { errors: editUsErrors, isSubmitting: isSubmittingEditUs } } = useForm<UserStoryInputs>({
    resolver: joiResolver(userStorySchema),
  });

  const { register: registerSprint, handleSubmit: handleSubmitSprint, reset: resetSprint, formState: { errors: sprintErrors, isSubmitting: isSubmittingSprint } } = useForm<SprintInputs>({
    resolver: joiResolver(sprintSchema),
  });

  const fetchData = async () => {
    try {
      const [usRes, sprintsRes, workshopRes] = await Promise.all([
        axios.get(`/api/workshops/${id}/user-stories`),
        axios.get(`/api/workshops/${id}/sprints`),
        axios.get(`/api/workshops/${id}`)
      ]);
      setUserStories(usRes.data.userStories);
      setSprints(sprintsRes.data.sprints);
      setWorkshopTags(workshopRes.data.workshop.tags || []);
      setWorkshopName(workshopRes.data.workshop.name);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const onSubmitCreateUs = async (data: UserStoryInputs) => {
    try {
      setError('');
      await axios.post(`/api/workshops/${id}/user-stories`, { ...data, sprint: null });
      setIsUsModalOpen(false);
      resetUs();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const openEditUsModal = (us: any) => {
    setEditingUs(us);
    resetEditUs({
      title: us.title,
      description: us.description || '',
      points: us.points || 0,
      tag: us.tag || '',
    });
    setIsEditUsModalOpen(true);
  };

  const onSubmitEditUs = async (data: UserStoryInputs) => {
    try {
      setError('');
      await axios.put(`/api/workshops/${id}/user-stories/${editingUs.id}`, data);
      setIsEditUsModalOpen(false);
      resetEditUs();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user story');
    }
  };

  const onSubmitCreateSprint = async (data: SprintInputs) => {
    try {
      setError('');
      await axios.post(`/api/workshops/${id}/sprints`, data);
      setIsSprintModalOpen(false);
      resetSprint();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    e.dataTransfer.setData('storyId', storyId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToSprint = async (e: React.DragEvent, sprintId: string) => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData('storyId');
    if (!storyId) return;

    // Optimistic UI Update
    const previousStories = [...userStories];
    setUserStories(userStories.filter(us => us.id !== storyId));

    try {
      await axios.put(`/api/workshops/${id}/user-stories/${storyId}`, { sprint: sprintId });
    } catch (err: any) {
      console.error(err);
      setUserStories(previousStories);
      alert(err.response?.data?.message || 'Failed to move user story');
    }
  };

  const handleDeleteUs = async (storyId: string) => {
    if (!window.confirm('Delete this user story?')) return;
    try {
      await axios.delete(`/api/workshops/${id}/user-stories/${storyId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="loading loading-spinner text-primary mx-auto mt-20 block"></div>;

  const totalPoints = userStories.reduce((acc, us) => acc + (us.points || 0), 0);

  const getTagColor = (tagName: string) => {
    const tag = workshopTags.find(t => t.name === tagName);
    return tag ? tag.color : '#a3a3a3';
  };

  const backlogStories = userStories.filter(us => !us.sprint);

  return (
    <div className="flex flex-col h-full bg-[#f5f7f9]">
      {/* Top Stats Bar */}
      <div className="bg-[#242b38] text-white p-4 flex gap-8 items-center shadow-md z-10 shrink-0">
        <div className="text-xl font-bold truncate text-[#47d2b2] min-w-37.5">
          {workshopName}
        </div>
        <div className="text-xl font-bold flex gap-2 items-end">
          <span className="text-2xl">0%</span>
          <span className="text-sm font-normal text-white/70 mb-1">completed</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">{totalPoints}</span>
          <span className="text-xs text-white/70">defined points</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">0</span>
          <span className="text-xs text-white/70">closed points</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 flex gap-8">
        {/* Backlog List */}
        <div className="flex-1 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#354052]">Backlog <span className="text-sm font-normal text-base-content/50 ml-2">{backlogStories.length} user stories</span></h1>
            <Button size="sm" variant="success" leftIcon={<Plus size={16} />} onClick={() => setIsUsModalOpen(true)}>
              User Story
            </Button>
          </div>

          <div className="bg-base-100 border border-base-200">
            {backlogStories.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <p className="text-base-content/50 mb-4">The backlog is empty!</p>
                <Button size="sm" variant="success" leftIcon={<Plus size={16} />} onClick={() => setIsUsModalOpen(true)}>
                  Add a User Story
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-base-300 border-t border-base-300">
                {backlogStories.map((us) => (
                  <div 
                    key={us.id} 
                    className="p-4 flex items-center justify-between bg-white hover:bg-base-200/50 transition-colors border-l-4 cursor-grab active:cursor-grabbing group" 
                    style={{ borderLeftColor: getTagColor(us.tag) }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, us.id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-[#a3a3a3]">#{us.id.substring(us.id.length - 4)}</span>
                      {us.tag && (
                         <span className="badge badge-sm border-none text-white px-2 py-3 font-semibold text-xs rounded" style={{ backgroundColor: getTagColor(us.tag) }}>
                           {us.tag}
                         </span>
                      )}
                      <span className="font-semibold text-[#354052]">{us.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        size="xs" variant="ghost" className="text-[#0092d1] opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEditUsModal(us)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="xs" variant="ghost" className="text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteUs(us.id)}
                      >
                        Delete
                      </Button>
                      <span className="badge badge-sm badge-ghost text-xs font-bold bg-base-200 border-none">{us.status}</span>
                      <div className="w-8 h-8 rounded bg-base-200 border border-base-300 flex items-center justify-center text-sm font-bold text-base-content/70">
                        {us.points || '?'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {userStories.length > 0 && (
            <p className="text-xs text-base-content/40 mt-2 italic">Drag a user story and drop it onto a Sprint to assign it.</p>
          )}
        </div>

        {/* Right Sidebar Sprints */}
        <div className="w-80 shrink-0">
          <Button 
            variant="primary" className="w-full mb-6" leftIcon={<Plus size={16} />}
            onClick={() => setIsSprintModalOpen(true)}
          >
            Create New Sprint
          </Button>
          
          <h2 className="text-[#354052] font-bold text-sm uppercase tracking-wider mb-4 border-b border-base-200 pb-2 flex justify-between">
            Sprints <span className="text-xs font-normal text-base-content/50 lowercase">{sprints.length} total</span>
          </h2>

          <div className="space-y-4">
            {sprints.map(sprint => {
              const sprintStories = userStories.filter(us => us.sprint === sprint.id);
              return (
              <div 
                key={sprint.id} 
                className="border-2 border-transparent border-b-base-300 bg-white shadow-sm p-4 rounded-sm hover:border-[#47d2b2] transition-all drop-zone"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropToSprint(e, sprint.id)}
                style={{ borderStyle: 'dashed' }} // To make it look like a drop zone
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#0092d1] text-sm hover:underline cursor-pointer">{sprint.name}</h3>
                </div>
                <div className="text-xs text-base-content/50 font-medium mb-3">
                  {new Date(sprint.startDate).toLocaleDateString()} to {new Date(sprint.endDate).toLocaleDateString()}
                </div>
                
                {sprintStories.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {sprintStories.map(us => (
                      <div key={us.id} className="text-xs bg-base-50 p-2 border border-base-200 rounded flex justify-between items-center group">
                        <span className="truncate pr-2 font-medium text-[#354052]">{us.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-[#a3a3a3]">{us.points || 0}p</span>
                          <button 
                            onClick={() => openEditUsModal(us)}
                            className="text-[#0092d1] opacity-0 group-hover:opacity-100 hover:scale-110"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUs(us.id)}
                            className="text-error opacity-0 group-hover:opacity-100 hover:scale-110"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-[10px] text-base-content/40 uppercase tracking-widest text-center border-2 border-dashed border-base-200 bg-base-50/50 py-3 rounded hover:bg-base-200/30 transition-colors">
                  Drop User Story Here
                </div>
              </div>
              );
            })}
            {sprints.length === 0 && (
              <p className="text-sm text-base-content/50 italic">No sprints defined yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Create US Modal (Taiga style) */}
      <Modal isOpen={isUsModalOpen} onClose={() => setIsUsModalOpen(false)} className="max-w-4xl p-8" hideCloseButton>
        {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmitUs(onSubmitCreateUs)}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 mr-8">
               <input 
                 type="text" 
                 placeholder="Subject"
                 className={`input input-bordered rounded-sm w-full text-lg font-semibold ${usErrors.title ? 'input-error' : ''}`} 
                 {...registerUs('title')} 
               />
               {usErrors.title && <span className="text-error text-xs mt-1 block">{usErrors.title.message}</span>}
               
               <div className="mt-4">
                 <select 
                   className={`select select-sm select-bordered rounded-sm text-[#0092d1] font-bold ${usErrors.tag ? 'select-error' : ''}`}
                   {...registerUs('tag')}
                 >
                   <option value="" disabled>Add tag +</option>
                   {workshopTags.map((t, i) => (
                     <option key={i} value={t.name}>{t.name}</option>
                   ))}
                 </select>
                 {usErrors.tag && <span className="text-error text-xs ml-2">{usErrors.tag.message}</span>}
                 {workshopTags.length === 0 && <span className="text-warning text-xs ml-2">Add tags in Settings first</span>}
               </div>
            </div>
            <div className="w-48">
               <select className="select select-bordered select-sm w-full bg-[#5d6878] text-white border-none rounded-sm">
                 <option value="NEW">New</option>
               </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Left Column */}
            <div className="flex-1">
              <textarea 
                placeholder="Please add descriptive text to help others better understand this user story"
                className="textarea textarea-bordered rounded-sm w-full h-64 text-sm resize-none" 
                {...registerUs('description')} 
              ></textarea>

              <div className="mt-4 bg-[#e7ebf2] p-3 text-center border-dashed border-2 border-[#d6dbe4] rounded-sm text-[#354052] font-semibold text-sm">
                Drop attachments here!
              </div>
            </div>

            {/* Right Column */}
            <div className="w-64 shrink-0">
              <div className="bg-[#f5f7f9] p-4 rounded-sm border border-base-200 mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-base-300 rounded-sm"></div>
                    <div className="text-[#0092d1] font-semibold text-sm cursor-pointer hover:underline">
                       Assign or<br/>Assign to me
                    </div>
                 </div>
              </div>

              <div>
                 <h4 className="text-xs font-bold text-[#354052] uppercase mb-2">Points</h4>
                 <div className="border border-base-200 rounded-sm overflow-hidden">
                   <div className="flex justify-between items-center p-3 bg-base-50 border-b border-base-200">
                      <span className="text-sm text-base-content/70">Total Points</span>
                      <input 
                        type="number" 
                        min="0"
                        className="input input-xs input-bordered rounded-sm w-16 text-right" 
                        {...registerUs('points')} 
                      />
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center border-t border-base-200 pt-6">
            <Button type="button" variant="ghost" className="mr-4" onClick={() => setIsUsModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="lg" variant="success" className="w-64" isLoading={isSubmittingUs}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Sprint Modal */}
      <Modal isOpen={isSprintModalOpen} onClose={() => setIsSprintModalOpen(false)} title="Create New Sprint">
        {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmitSprint(onSubmitCreateSprint)} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Sprint Name</span></label>
            <input 
              type="text" 
              placeholder="e.g. Sprint 1"
              className={`input input-bordered rounded-sm w-full ${sprintErrors.name ? 'input-error' : ''}`} 
              {...registerSprint('name')} 
            />
            {sprintErrors.name && <span className="text-error text-xs mt-1">{sprintErrors.name.message}</span>}
          </div>
          <div className="flex gap-4">
            <div className="form-control flex-1">
              <label className="label"><span className="label-text">Start Date</span></label>
              <input 
                type="date" 
                className={`input input-bordered rounded-sm w-full ${sprintErrors.startDate ? 'input-error' : ''}`} 
                {...registerSprint('startDate')} 
              />
              {sprintErrors.startDate && <span className="text-error text-xs mt-1">Start date required</span>}
            </div>
            <div className="form-control flex-1">
              <label className="label"><span className="label-text">End Date</span></label>
              <input 
                type="date" 
                className={`input input-bordered rounded-sm w-full ${sprintErrors.endDate ? 'input-error' : ''}`} 
                {...registerSprint('endDate')} 
              />
              {sprintErrors.endDate && <span className="text-error text-xs mt-1">End date required</span>}
            </div>
          </div>
          <div className="modal-action">
            <Button type="button" variant="ghost" onClick={() => setIsSprintModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingSprint}>
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit US Modal */}
      <Modal isOpen={isEditUsModalOpen} onClose={() => setIsEditUsModalOpen(false)} className="max-w-4xl p-8" hideCloseButton>
        {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmitEditUs(onSubmitEditUs)}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 mr-8">
               <input 
                 type="text" 
                 placeholder="Subject"
                 className={`input input-bordered rounded-sm w-full text-lg font-semibold ${editUsErrors.title ? 'input-error' : ''}`} 
                 {...registerEditUs('title')} 
               />
               {editUsErrors.title && <span className="text-error text-xs mt-1 block">{editUsErrors.title.message}</span>}
               
               <div className="mt-4">
                 <select 
                   className={`select select-sm select-bordered rounded-sm text-[#0092d1] font-bold ${editUsErrors.tag ? 'select-error' : ''}`}
                   {...registerEditUs('tag')}
                 >
                   <option value="" disabled>Add tag +</option>
                   {workshopTags.map((t, i) => (
                     <option key={i} value={t.name}>{t.name}</option>
                   ))}
                 </select>
                 {editUsErrors.tag && <span className="text-error text-xs ml-2">{editUsErrors.tag.message}</span>}
               </div>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <textarea 
                placeholder="Please add descriptive text to help others better understand this user story"
                className="textarea textarea-bordered rounded-sm w-full h-64 text-sm resize-none" 
                {...registerEditUs('description')} 
              ></textarea>
            </div>

            <div className="w-64 shrink-0">
              <div>
                 <h4 className="text-xs font-bold text-[#354052] uppercase mb-2">Points</h4>
                 <div className="border border-base-200 rounded-sm overflow-hidden">
                   <div className="flex justify-between items-center p-3 bg-base-50 border-b border-base-200">
                      <span className="text-sm text-base-content/70">Total Points</span>
                      <input 
                        type="number" 
                        min="0"
                        className="input input-xs input-bordered rounded-sm w-16 text-right" 
                        {...registerEditUs('points')} 
                      />
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center border-t border-base-200 pt-6">
            <Button type="button" variant="ghost" className="mr-4" onClick={() => setIsEditUsModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="lg" variant="primary" className="w-64" isLoading={isSubmittingEditUs}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
