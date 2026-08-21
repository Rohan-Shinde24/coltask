import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Edit2, Trash2, ChevronRight, CalendarDays, User } from 'lucide-react';

interface Assignee {
  id: string;
  name?: string;
  email?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  createdAt: string | Date;
  assignees?: Assignee[];
}

interface TaskCardProps {
  task: Task;
  index: number;
  tagColor: string | null;
  parentUserStoryTag?: string;
  canEdit: boolean;
  openEditModal: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, newStatus: string) => void;
  getNextStatus: (status: string) => string | null;
}

export function TaskCard({
  task,
  index,
  tagColor,
  parentUserStoryTag,
  canEdit,
  openEditModal,
  handleDeleteTask,
  updateTaskStatus,
  getNextStatus,
}: TaskCardProps) {
  const nextStatus = getNextStatus(task.status);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="relative mb-3 last:mb-0"
        >
          <motion.div
            initial={false}
            animate={{
              scale: snapshot.isDragging ? 1.05 : 1,
              boxShadow: snapshot.isDragging
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`
              group relative
              bg-white
              border ${snapshot.isDragging ? 'border-black' : 'border-black/10'}
              rounded-xl
              p-3.5
              cursor-grab
              active:cursor-grabbing
              hover:border-black/30
              transition-colors duration-200
            `}
            style={tagColor ? { borderLeftWidth: '4px', borderLeftColor: tagColor } : undefined}
          >
            {/* Top Color Tag */}
            {tagColor && (
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tagColor }} />
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider truncate max-w-37.5" title={parentUserStoryTag}>
                  {parentUserStoryTag || 'User Story'}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            {canEdit && (
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-lg border border-black/10 p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(task);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-black/40 hover:text-black hover:bg-black/5 transition-colors"
                  aria-label="Edit Task"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-black/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Delete Task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            {/* Task ID */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-black/30 uppercase">
                TASK-{task.id.slice(-5)}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-[13px] font-medium text-black leading-5 pr-2 mb-4 line-clamp-2">
              {task.title}
            </h4>

            {/* Divider */}
            <div className="border-t border-black/5 mb-3" />

            {/* Bottom Information */}
            <div className="flex items-center justify-between">
              {/* Date */}
              <div className="flex items-center gap-1.5 text-black/40">
                <CalendarDays size={12} />
                <span className="text-[10px] font-medium">
                  {new Date(task.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                </span>
              </div>

              {/* Assignees */}
              {task.assignees && task.assignees.length > 0 ? (
                <div className="flex items-center">
                  <div className="flex -space-x-1.5">
                    {task.assignees.slice(0, 3).map((assignee) => {
                      const displayName = assignee.name || assignee.email || '?';
                      return (
                        <div
                          key={assignee.id}
                          className="w-6 h-6 rounded-full bg-black border-2 border-white flex items-center justify-center text-[9px] font-bold text-white tooltip tooltip-bottom"
                          data-tip={displayName}
                        >
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                  {task.assignees.length > 3 && (
                    <span className="text-[9px] font-bold text-black/40 ml-1">
                      +{task.assignees.length - 3}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-black/30">
                  <User size={12} />
                  <span className="text-[10px] font-medium">Unassigned</span>
                </div>
              )}
            </div>

            {/* Status Controls */}
            {canEdit && (
              <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="bg-black/5 text-[10px] font-bold text-black/60 uppercase tracking-wider border-none rounded px-2 py-1 outline-none cursor-pointer hover:bg-black/10 transition-colors"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="READY_FOR_TEST">Ready for Test</option>
                  <option value="CLOSED">Closed</option>
                </select>

                {nextStatus && (
                  <button
                    type="button"
                    onClick={() => updateTaskStatus(task.id, nextStatus)}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#0092d1] hover:bg-[#0092d1]/10 px-2 py-1 rounded transition-colors uppercase tracking-wider"
                  >
                    Next <ChevronRight size={12} />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
