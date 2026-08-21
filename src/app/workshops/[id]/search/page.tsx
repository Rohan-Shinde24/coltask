'use client';

import { useState, use } from 'react';
import axios from 'axios';
import { Search as SearchIcon, CheckSquare, Target } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ userStories: any[], tasks: any[] }>({ userStories: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await axios.get(`/api/workshops/${id}/search?q=${encodeURIComponent(query)}`);
      setResults({
        userStories: res.data.userStories || [],
        tasks: res.data.tasks || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.userStories.length + results.tasks.length;

  return (
    <div className="flex h-full bg-white text-[#354052]">
      <div className="flex-1 p-8 overflow-auto max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0092d1] mb-8 pb-4 border-b border-base-200">Search Project</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Search for tasks or user stories..." 
              className="input input-lg input-bordered w-full pl-12 rounded-sm text-[#354052] bg-base-100 focus:outline-none focus:border-[#0092d1]" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-2 btn btn-sm btn-[#0092d1] text-white border-none rounded-sm"
              disabled={loading}
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12"><span className="loading loading-spinner text-primary loading-lg"></span></div>
        ) : hasSearched ? (
          <div>
            <p className="text-sm text-base-content/50 mb-6 font-semibold uppercase tracking-wider">
              {totalResults} Results found
            </p>

            {results.userStories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#354052] mb-4 flex items-center gap-2 border-b border-base-200 pb-2">
                  <Target size={20} className="text-[#0092d1]" /> User Stories ({results.userStories.length})
                </h2>
                <div className="space-y-3">
                  {results.userStories.map(us => (
                    <div key={us.id} className="p-4 bg-base-50 border border-base-200 rounded-sm hover:border-[#0092d1] transition-colors">
                      <div className="flex justify-between items-center">
                        <Link href={`/workshops/${id}/backlog`} className="font-bold text-[#0092d1] hover:underline">
                          {us.title}
                        </Link>
                        <span className="badge badge-sm badge-ghost">{us.status}</span>
                      </div>
                      <div className="text-xs text-base-content/50 mt-2 font-mono">
                        #{us.id.substring(us.id.length - 4)} • {us.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.tasks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#354052] mb-4 flex items-center gap-2 border-b border-base-200 pb-2">
                  <CheckSquare size={20} className="text-[#0092d1]" /> Tasks ({results.tasks.length})
                </h2>
                <div className="space-y-3">
                  {results.tasks.map(task => (
                    <div key={task.id} className="p-4 bg-base-50 border border-base-200 rounded-sm hover:border-[#0092d1] transition-colors">
                      <div className="flex justify-between items-center">
                        <Link href={`/workshops/${id}`} className="font-bold text-[#0092d1] hover:underline">
                          {task.title}
                        </Link>
                        <span className="badge badge-sm badge-ghost">{task.status}</span>
                      </div>
                      <div className="text-xs text-base-content/50 mt-2 font-mono">
                        Task #{task.id.substring(task.id.length - 4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="text-center py-12 text-base-content/50 border border-base-200 bg-base-50 rounded-sm">
                No matching tasks or user stories found for "{query}".
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-base-content/40 flex flex-col items-center">
             <SearchIcon size={48} className="mb-4 opacity-50" />
             <p>Type a keyword above to search through the project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
