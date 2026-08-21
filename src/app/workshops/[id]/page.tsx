'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { Plus, Edit2, Activity, LayoutDashboard, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TaskCard } from '@/components/TaskCard';

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  userStory: Joi.string().optional(),
  assignees: Joi.any().optional(),
});
type CreateTaskInputs = { title: string; userStory: string; assignees?: any };

const editTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  assignees: Joi.any().optional(),
});
type EditTaskInputs = { title: string; description?: string; assignees?: any };

export default function SprintTaskboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [workshopRole, setWorkshopRole] = useState<string>('member');
  const [workshopName, setWorkshopName] = useState<string>('');

  const [sprints, setSprints] = useState<any[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [sprint, setSprint] = useState<any>(null);
  const [workshopTags, setWorkshopTags] = useState<{ name: string, color: string }[]>([]);
  const [workshopMembers, setWorkshopMembers] = useState<any[]>([]);

  const [userStories, setUserStories] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedUserStoryId, setSelectedUserStoryId] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateTaskInputs>({
    resolver: joiResolver(createTaskSchema),
  });

  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { isSubmitting: isSubmittingEdit } } = useForm<EditTaskInputs>({
    resolver: joiResolver(editTaskSchema),
  });

  const fetchData = async () => {
    try {
      const [meRes, workshopRes] = await Promise.all([
        axios.get('/api/auth/me').catch(() => null),
        axios.get(`/api/workshops/${id}`)
      ]);
      const user = meRes?.data?.user;
      if (user) setCurrentUser(user);

      const member = workshopRes.data.workshop.members.find((m: any) => m.user.id === user?.id || m.user === user?.id);
      if (member) setWorkshopRole(member.role);

      setWorkshopName(workshopRes.data.workshop.name);
      setWorkshopTags(workshopRes.data.workshop.tags || []);
      setWorkshopMembers(workshopRes.data.workshop.members || []);

      const sprintsRes = await axios.get(`/api/workshops/${id}/sprints`);
      setSprints(sprintsRes.data.sprints);

      let currentSprint = null;
      if (sprintsRes.data.sprints.length > 0) {
        currentSprint = selectedSprintId
          ? sprintsRes.data.sprints.find((s: any) => s.id === selectedSprintId)
          : sprintsRes.data.sprints[0];

        if (!selectedSprintId && currentSprint) {
          setSelectedSprintId(currentSprint.id);
        }
      }
      setSprint(currentSprint);

      if (currentSprint) {
        const usRes = await axios.get(`/api/workshops/${id}/user-stories?sprint=${currentSprint.id}`);
        setUserStories(usRes.data.userStories);

        const tasksRes = await axios.get(`/api/workshops/${id}/tasks`);
        setTasks(tasksRes.data.tasks);

        const logsRes = await axios.get(`/api/workshops/${id}/logs`);
        setLogs(logsRes.data.logs.slice(0, 10)); 
      } else {
        setUserStories([]);
        setTasks([]);
        setLogs([]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, selectedSprintId]);

  const onSubmitTask = async (data: CreateTaskInputs) => {
    try {
      let formattedAssignees: string[] = [];
      if (Array.isArray(data.assignees)) {
        formattedAssignees = data.assignees.filter(a => typeof a === 'string') as string[];
      } else if (typeof data.assignees === 'string') {
        formattedAssignees = [data.assignees];
      }

      await axios.post(`/api/workshops/${id}/tasks`, { ...data, assignees: formattedAssignees });
      setIsTaskModalOpen(false);
      reset();
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save task. Please check the console for more details.');
    }
  };

  const onSubmitEditTask = async (data: EditTaskInputs) => {
    try {
      let formattedAssignees: string[] = [];
      if (Array.isArray(data.assignees)) {
        formattedAssignees = data.assignees.filter(a => typeof a === 'string') as string[];
      } else if (typeof data.assignees === 'string') {
        formattedAssignees = [data.assignees];
      }

      await axios.put(`/api/workshops/${id}/tasks/${editingTask.id}`, { ...data, assignees: formattedAssignees });
      setIsEditModalOpen(false);
      resetEdit();
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    resetEdit({
      title: task.title,
      description: task.description || '',
      assignees: task.assignees ? task.assignees.map((a: any) => a.id || a) : [],
    });
    setIsEditModalOpen(true);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await axios.put(`/api/workshops/${id}/tasks/${taskId}`, { status: newStatus });
      const logsRes = await axios.get(`/api/workshops/${id}/logs`);
      setLogs(logsRes.data.logs.slice(0, 10));
    } catch (err) {
      setTasks(previousTasks);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // destination.droppableId is formatted as `${userStoryId}-${status}`
    const newStatus = destination.droppableId.split('-')[1];
    const newUserStoryId = destination.droppableId.split('-')[0];

    // Optimistically update the UI
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === draggableId ? { ...t, status: newStatus, userStoryId: newUserStoryId } : t));

    axios.put(`/api/workshops/${id}/tasks/${draggableId}`, { status: newStatus, userStory: newUserStoryId })
      .then(async () => {
        const logsRes = await axios.get(`/api/workshops/${id}/logs`);
        setLogs(logsRes.data.logs.slice(0, 10));
      })
      .catch(() => {
        setTasks(previousTasks);
      });
  };

  const canEdit = (task: any) => {
    if (workshopRole === 'admin') return true;
    if (currentUser && task.createdById && task.createdById.toString() === currentUser.id) return true;
    if (currentUser && task.assignees && task.assignees.some((a: any) => (a.id || a).toString() === currentUser.id)) return true;
    return false;
  };

  const getTagColor = (tagName: string) => {
    const tag = workshopTags.find(t => t.name === tagName);
    return tag ? tag.color : '#a3a3a3';
  };

  const getNextStatus = (current: string) => {
    if (current === 'NEW') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'READY_FOR_TEST';
    if (current === 'READY_FOR_TEST') return 'CLOSED';
    return null;
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/workshops/${id}/tasks/${taskId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const columns = ['NEW', 'IN_PROGRESS', 'READY_FOR_TEST', 'CLOSED'];
  const columnHeaders = [
    { label: 'NEW', color: 'border-slate-500', bgDefault: 'bg-slate-100/40', bgHover: 'hover:bg-slate-200/60', bgDrag: 'bg-slate-300/60' },
    { label: 'IN PROGRESS', color: 'border-blue-500', bgDefault: 'bg-blue-100/40', bgHover: 'hover:bg-blue-200/60', bgDrag: 'bg-blue-300/60' },
    { label: 'READY FOR TEST', color: 'border-amber-500', bgDefault: 'bg-amber-100/40', bgHover: 'hover:bg-amber-200/60', bgDrag: 'bg-amber-300/60' },
    { label: 'CLOSED', color: 'border-emerald-500', bgDefault: 'bg-emerald-100/40', bgHover: 'hover:bg-emerald-200/60', bgDrag: 'bg-emerald-300/60' }
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfdfc]"><span className="loading loading-spinner text-black w-8 h-8"></span></div>;

  return (
    <div className="flex flex-col h-full bg-[#fdfdfc] text-black font-sans">
      {/* Top Stats Bar - Redesigned to plain black/white */}
      <div className="bg-white border-b border-black/10 p-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 z-10 shrink-0 sticky top-0">
        
        <div className="flex items-center gap-3 min-w-37.5 border-r border-black/10 pr-4">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shrink-0">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div className="text-xl font-heading font-bold truncate text-black max-w-50">
            {workshopName}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            className="bg-black/5 text-black border border-transparent rounded-lg px-4 py-2 font-semibold text-sm hover:bg-black/10 transition-colors focus:ring-1 focus:ring-black outline-none"
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
          >
            {sprints.length === 0 && <option value="" disabled>No Sprints</option>}
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {sprint && (
            <span className="text-xs text-black/50 font-medium">
              {new Date(sprint.startDate).toLocaleDateString()} to {new Date(sprint.endDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex-1"></div>

        <div className="flex gap-8 items-center overflow-x-auto">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold font-heading">{userStories.reduce((a, b) => a + (b.points || 0), 0)}</span>
            <span className="text-[10px] uppercase tracking-wider text-black/40 font-bold">Total Points</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold font-heading">{tasks.filter(t => t.status !== 'CLOSED').length}</span>
            <span className="text-[10px] uppercase tracking-wider text-black/40 font-bold">Open Tasks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold font-heading">{tasks.filter(t => t.status === 'CLOSED').length}</span>
            <span className="text-[10px] uppercase tracking-wider text-black/40 font-bold">Closed Tasks</span>
          </div>
          <div className="ml-4 border-l border-black/10 pl-4">
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isLogsOpen ? 'bg-black text-white' : 'bg-black/5 text-black hover:bg-black/10'}`}
              onClick={() => setIsLogsOpen(!isLogsOpen)}
            >
              <Activity size={16} /> Activity
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex bg-[#fdfdfc]">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-auto flex flex-col relative">
            {/* Table Header */}
            <div className="grid grid-cols-5 sticky top-0 bg-white z-20 border-b border-black shrink-0 shadow-sm">
              <div className="font-heading font-bold text-[11px] text-black/50 uppercase tracking-wider p-4 border-r border-black">User Story</div>
              {columnHeaders.map((col, i) => (
                <div key={col.label} className={`font-heading font-bold text-[11px] text-black/70 uppercase tracking-wider p-4 border-r border-black last:border-r-0 border-t-4 ${col.color}`}>
                  {col.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="relative z-10 flex-1 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-size-[24px_24px]">
              {userStories.map(us => {
                const storyTasks = tasks.filter(t => t.userStoryId === us.id);
                return (
                  <div key={us.id} className="grid grid-cols-5 border-b border-black min-h-40 group">
                    {/* User Story Cell */}
                    <div className="p-4 border-r border-black bg-white flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-black mb-1 leading-tight group-hover:text-[#0092d1] transition-colors">{us.title}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-black/40 font-mono font-bold">#{us.id.substring(us.id.length - 4)}</span>
                          {us.tag && (
                            <span className="px-2 py-0.5 rounded border border-black/10 text-[10px] font-bold bg-black/5 text-black/60">{us.tag}</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center pt-3 border-t border-black/5">
                        <span className="text-xs font-bold text-black/40">{us.points} PTS</span>
                        <button
                          className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                          onClick={() => { setSelectedUserStoryId(us.id); setIsTaskModalOpen(true); }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Task Columns (Droppable) */}
                    {columns.map((col, i) => {
                      const colTasks = storyTasks.filter(t => t.status === col);
                      const colStyles = columnHeaders[i];
                      return (
                        <Droppable key={col} droppableId={`${us.id}-${col}`}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-2 border-r border-black last:border-0 transition-colors ${snapshot.isDraggingOver ? colStyles.bgDrag : `${colStyles.bgDefault} ${colStyles.bgHover}`}`}
                            >
                              <div className="flex flex-col min-h-full">
                                {colTasks.map((task, index) => {
                                  const parentUserStory = userStories.find(s => s.id === task.userStoryId);
                                  const tagColor = parentUserStory?.tag ? getTagColor(parentUserStory.tag) : null;
                                  return (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      index={index}
                                      tagColor={tagColor}
                                      parentUserStoryTag={parentUserStory?.tag}
                                      canEdit={canEdit(task)}
                                      openEditModal={openEditModal}
                                      handleDeleteTask={handleDeleteTask}
                                      updateTaskStatus={updateTaskStatus}
                                      getNextStatus={getNextStatus}
                                    />
                                  )
                                })}
                                {provided.placeholder}
                              </div>
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                );
              })}

              {/* Empty space that fills remaining height and draws column lines */}
              <div className="grid grid-cols-5 flex-1 relative min-h-75">
                <div className="border-r border-black bg-white"></div>
                <div className="border-r border-black"></div>
                <div className="border-r border-black"></div>
                <div className="border-r border-black"></div>
                <div></div>

                {userStories.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-black/40 font-medium bg-[#fdfdfc] px-6 py-3 rounded-full border border-black/10 shadow-sm">No User Stories found for this sprint.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DragDropContext>

        {/* Right Side Activity Panel */}
        {isLogsOpen && (
          <div className="w-80 bg-white border-l border-black/10 shrink-0 flex flex-col h-full overflow-hidden shadow-2xl relative z-30">
            <div className="p-4 border-b border-black/10 bg-[#fdfdfc] flex justify-between items-center">
              <h3 className="font-heading font-bold text-[11px] text-black/60 uppercase tracking-wider">Recent Activity</h3>
              <button onClick={() => setIsLogsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-black/50 hover:text-black transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-5 space-y-5">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-4 border-l-2 border-black/10 pb-5 last:pb-0">
                  <div className="absolute w-2 h-2 bg-black rounded-full -left-1.25 top-1.5 ring-4 ring-white"></div>
                  <div className="text-sm">
                    <span className="font-bold text-black">{log.user?.name || 'User'}</span>{' '}
                    <span className="text-black/60">{log.action}</span>{' '}
                    <span className="font-semibold text-black">{log.targetName}</span>
                    {log.details && <span className="text-black/60 block mt-1 text-xs"> {log.details}</span>}
                  </div>
                  <div className="text-[10px] font-bold text-black/30 mt-2 tracking-wide uppercase">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-sm text-black/40 text-center mt-10 font-medium">No recent activity.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="New Task" className="rounded-2xl">
        <form onSubmit={handleSubmit((data) => onSubmitTask({ ...data, userStory: selectedUserStoryId }))} className="space-y-5 p-2">
          <div>
            <label className="block text-sm font-semibold mb-2">Task Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. Implement WebSocket listener"
              {...register('title', { required: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Assignees</label>
            <div className="flex flex-wrap gap-2 border border-black/10 p-3 rounded-xl max-h-40 overflow-y-auto bg-white">
              {workshopMembers.map(m => (
                <label key={m.user.id} className="cursor-pointer flex items-center gap-3 p-2 hover:bg-black/5 rounded-lg flex-1 min-w-37.5 transition-colors">
                  <input type="checkbox" value={m.user.id} className="w-4 h-4 rounded border-black/20 text-black focus:ring-black" {...register('assignees')} />
                  <span className="text-sm font-medium text-black truncate" title={m.user.name || m.user.email}>{m.user.name || m.user.email}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-black hover:bg-black/5 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-medium bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditModalOpen && !!editingTask} onClose={() => setIsEditModalOpen(false)} title="Edit Task" className="rounded-2xl">
        <form onSubmit={handleEditSubmit(onSubmitEditTask)} className="space-y-5 p-2">
          <div>
            <label className="block text-sm font-semibold mb-2">Task Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              {...registerEdit('title', { required: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all h-32 resize-none"
              placeholder="Add more details about this task..."
              {...registerEdit('description')}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Assignees</label>
            <div className="flex flex-wrap gap-2 border border-black/10 p-3 rounded-xl max-h-40 overflow-y-auto bg-white">
              {workshopMembers.map(m => (
                <label key={m.user.id} className="cursor-pointer flex items-center gap-3 p-2 hover:bg-black/5 rounded-lg flex-1 min-w-37.5 transition-colors">
                  <input type="checkbox" value={m.user.id} className="w-4 h-4 rounded border-black/20 text-black focus:ring-black" {...registerEdit('assignees')} />
                  <span className="text-sm font-medium text-black truncate" title={m.user.name || m.user.email}>{m.user.name || m.user.email}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-black hover:bg-black/5 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-medium bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-50" disabled={isSubmittingEdit}>
              {isSubmittingEdit ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
