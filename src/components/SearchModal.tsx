'use client';

import { useState } from 'react';
import axios from 'axios';
import { Search as SearchIcon, CheckSquare, Target, X } from 'lucide-react';
import Link from 'next/link';

export default function SearchModal({ workshopId }: { workshopId: string }) {
  const [isOpen, setIsOpen] = useState(false);
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
      const res = await axios.get(`/api/workshops/${workshopId}/search?q=${encodeURIComponent(query)}`);
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

  const closeAndReset = () => {
    setIsOpen(false);
    setQuery('');
    setResults({ userStories: [], tasks: [] });
    setHasSearched(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full text-left hover:bg-white/5 hover:text-white rounded-none py-3 px-4 font-semibold text-sm flex items-center gap-2"
      >
        <SearchIcon size={18} /> Search
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <form onSubmit={handleSearch} className="p-4 border-b border-base-200 relative flex items-center gap-2">
              <SearchIcon className="h-5 w-5 text-base-content/40" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search for tasks or user stories..." 
                className="input input-ghost w-full focus:outline-none text-lg text-[#354052]" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && <span className="loading loading-spinner text-primary loading-sm"></span>}
              <button type="button" onClick={closeAndReset} className="btn btn-ghost btn-circle btn-sm text-base-content/50">
                <X size={18} />
              </button>
            </form>

            <div className="overflow-auto p-4 flex-1">
              {hasSearched ? (
                <>
                  <p className="text-xs text-base-content/50 mb-4 font-semibold uppercase tracking-wider px-2">
                    {totalResults} Results found
                  </p>

                  {results.userStories.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-[#354052] mb-2 flex items-center gap-2 px-2">
                        <Target size={16} className="text-[#0092d1]" /> User Stories
                      </h2>
                      <div className="space-y-1">
                        {results.userStories.map(us => (
                          <Link 
                            href={`/workshops/${workshopId}/backlog`} 
                            key={us.id} 
                            onClick={closeAndReset}
                            className="block p-3 rounded-md hover:bg-base-200 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[#0092d1]">{us.title}</span>
                              <span className="badge badge-sm badge-ghost">{us.status}</span>
                            </div>
                            <div className="text-xs text-base-content/50 mt-1 font-mono">
                              #{us.id.substring(us.id.length - 4)} • {us.points} pts
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.tasks.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-[#354052] mb-2 flex items-center gap-2 px-2">
                        <CheckSquare size={16} className="text-[#0092d1]" /> Tasks
                      </h2>
                      <div className="space-y-1">
                        {results.tasks.map(task => (
                          <Link 
                            href={`/workshops/${workshopId}`} 
                            key={task.id} 
                            onClick={closeAndReset}
                            className="block p-3 rounded-md hover:bg-base-200 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[#0092d1]">{task.title}</span>
                              <span className="badge badge-sm badge-ghost">{task.status}</span>
                            </div>
                            <div className="text-xs text-base-content/50 mt-1 font-mono">
                              Task #{task.id.substring(task.id.length - 4)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {totalResults === 0 && (
                    <div className="text-center py-12 text-base-content/50">
                      No matching tasks or user stories found for "{query}".
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-base-content/40 flex flex-col items-center">
                   <p>Type a keyword and press Enter to search.</p>
                </div>
              )}
            </div>
          </div>
          <div className="fixed inset-0 z-[-1]" onClick={closeAndReset}></div>
        </div>
      )}
    </>
  );
}
