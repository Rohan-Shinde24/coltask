'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityLogs({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`/api/workshops/${id}/logs`);
        setLogs(res.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [id]);

  if (loading) return <div className="loading loading-spinner text-primary mx-auto mt-20 block"></div>;

  return (
    <div className="flex h-full bg-white text-[#354052]">
      <div className="flex-1 p-8 overflow-auto max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0092d1] mb-8 pb-4 border-b border-base-200">Project Activity</h1>

        {logs.length === 0 ? (
          <div className="text-center text-base-content/50 py-12">No activity logged yet.</div>
        ) : (
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 p-4 border border-base-200 bg-base-50/50 rounded-sm">
                <div className="w-10 h-10 rounded bg-[#9fb7a2] text-white flex items-center justify-center font-bold shrink-0 text-lg uppercase">
                  {log.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-bold text-[#354052]">{log.user?.name || 'Unknown User'}</span>{' '}
                    <span className="text-base-content/70">{log.action}</span>{' '}
                    <span className="font-semibold text-[#0092d1]">{log.targetName}</span>
                    {log.details && <span className="text-base-content/70"> {log.details}</span>}
                  </div>
                  <div className="text-xs text-base-content/40 flex items-center gap-1 mt-1 font-mono">
                    <Clock size={12} /> 
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString()}
                    <span className="ml-2 text-base-content/30 italic">({formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
