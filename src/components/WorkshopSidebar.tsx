'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings, ArrowLeft, Search, BookOpen, Layers, Target, Activity, MessageSquare, LogOut } from 'lucide-react';
import SearchModal from '@/components/SearchModal';
import axios from 'axios';

interface WorkshopSidebarProps {
  id: string;
  workshopName: string;
}

export function WorkshopSidebar({ id, workshopName }: WorkshopSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isChat = pathname?.includes(`/workshops/${id}/chat`);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // If minimized (on chat page), we shrink the sidebar
  if (isChat) {
    return (
      <aside className="w-16 bg-[#2b323a] text-white border-r border-[#1a1f24] min-h-screen flex flex-col shrink-0 items-center py-4 gap-6 transition-all duration-300">
        <Link href={`/workshops/${id}`} className="w-8 h-8 rounded bg-primary text-primary-content flex items-center justify-center font-bold tooltip tooltip-right" data-tip={workshopName}>
          {workshopName.charAt(0).toUpperCase() || 'P'}
        </Link>
        
        <nav className="flex-1 flex flex-col items-center gap-4 w-full">
          <Link href={`/workshops/${id}/backlog`} className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl tooltip tooltip-right" data-tip="Backlog">
            <Target size={20} />
          </Link>
          <Link href={`/workshops/${id}`} className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl tooltip tooltip-right" data-tip="Taskboard">
            <LayoutDashboard size={20} />
          </Link>
          <Link href={`/workshops/${id}/logs`} className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl tooltip tooltip-right" data-tip="Logs">
            <Activity size={20} />
          </Link>
          <Link href={`/workshops/${id}/chat`} className="p-3 text-[#0092d1] bg-white/5 rounded-xl tooltip tooltip-right" data-tip="Chat">
            <MessageSquare size={20} />
          </Link>
          <div className="w-8 border-t border-white/10 my-2"></div>
          <Link href={`/workshops/${id}/team`} className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl tooltip tooltip-right" data-tip="Team">
            <Users size={20} />
          </Link>
          <Link href={`/workshops/${id}/settings`} className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl tooltip tooltip-right" data-tip="Settings">
            <Settings size={20} />
          </Link>
          <div className="w-8 border-t border-white/10 my-2"></div>
          <button onClick={handleLogout} className="p-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl tooltip tooltip-right transition-colors" data-tip="Logout">
            <LogOut size={20} />
          </button>
        </nav>
      </aside>
    );
  }

  // Full sidebar
  return (
    <aside className="w-full md:w-64 bg-[#2b323a] text-white border-r border-[#1a1f24] md:min-h-screen flex flex-col shrink-0 transition-all duration-300">
      <div className="p-4 bg-[#1f252b] border-b border-[#1a1f24] flex flex-col gap-2">
        <Link href="/workshops" className="text-xs text-white/50 hover:text-white flex items-center gap-1 uppercase tracking-wider font-semibold">
          <ArrowLeft size={12} /> Projects
        </Link>
        <div className="flex items-center gap-3 mt-2">
           <div className="w-8 h-8 rounded bg-primary text-primary-content flex items-center justify-center font-bold shrink-0">
              {workshopName.charAt(0).toUpperCase() || 'P'}
           </div>
           <h2 className="text-sm font-bold truncate text-white leading-tight" title={workshopName}>
              {workshopName || 'Loading Project...'}
           </h2>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="menu menu-md w-full p-0 text-white/70">
          <li>
            <details open>
              <summary className="hover:bg-white/5 hover:text-white rounded-none py-3 px-4 font-semibold text-sm">
                <Target size={18} /> Scrum
              </summary>
              <ul className="pl-0 mt-1 space-y-1">
                <li>
                  <Link href={`/workshops/${id}/backlog`} className="hover:bg-white/5 hover:text-white rounded-none pl-12 py-2 text-sm">
                    Backlog
                  </Link>
                </li>
                <li>
                  <Link href={`/workshops/${id}`} className="hover:bg-white/5 hover:text-white rounded-none pl-12 py-2 text-sm">
                    Taskboard
                  </Link>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <Link href={`/workshops/${id}/logs`} className="hover:bg-white/5 hover:text-white rounded-none py-3 px-4 font-semibold text-sm">
              <Activity size={18} /> Logs
            </Link>
          </li>
          <li>
            <Link href={`/workshops/${id}/chat`} className="hover:bg-white/5 hover:text-white rounded-none py-3 px-4 font-semibold text-sm">
              <MessageSquare size={18} /> Chat
            </Link>
          </li>
          <li className="p-0">
            <SearchModal workshopId={id} />
          </li>
          <div className="my-2 border-t border-white/10"></div>
          <li>
            <Link href={`/workshops/${id}/team`} className="hover:bg-white/5 hover:text-white rounded-none py-3 px-4 font-semibold text-sm">
              <Users size={18} /> Team
            </Link>
          </li>
          <li>
            <Link href={`/workshops/${id}/settings`} className="hover:bg-white/5 hover:text-white rounded-none py-3 px-4 font-semibold text-sm">
              <Settings size={18} /> Settings
            </Link>
          </li>
          <div className="my-2 border-t border-white/10"></div>
          <li>
            <button onClick={handleLogout} className="hover:bg-white/5 text-red-400 hover:text-red-300 rounded-none py-3 px-4 font-semibold text-sm transition-colors text-left flex items-center gap-2">
              <LogOut size={18} /> Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
