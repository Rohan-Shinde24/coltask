'use client';

import { Search, Users } from 'lucide-react';

interface ChatMemberListProps {
  members: any[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedMember: any;
  setSelectedMember: (member: any) => void;
  unreadCounts: Record<string, number>;
}

export function ChatMemberList({
  members,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedMember,
  setSelectedMember,
  unreadCounts
}: ChatMemberListProps) {
  const filteredMembers = members.filter(m => 
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 sm:w-96 border-r border-base-200 flex flex-col bg-white shrink-0">
      {/* Contacts Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-base-200 bg-base-50 shrink-0">
        <h2 className="font-bold text-lg text-base-content">Chats</h2>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-base-200 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            className="w-full pl-10 pr-4 py-2 bg-base-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0092d1]/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 flex justify-center"><span className="loading loading-spinner text-[#0092d1]"></span></div>
        ) : (
          <>
            {/* Group Chat Item */}
            {searchQuery === '' && (
              <div 
                onClick={() => setSelectedMember({ id: 'group', name: 'Project Group Chat' })}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-base-100
                  ${selectedMember?.id === 'group' ? 'bg-[#0092d1]/10' : 'hover:bg-base-50'}
                `}
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  <Users size={20} />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm truncate text-base-content">Project Group Chat</h3>
                    <p className="text-xs text-base-content/60 truncate">
                      {selectedMember?.id === 'group' ? 'Active chat' : 'Workspace discussion'}
                    </p>
                  </div>
                  {unreadCounts['group'] > 0 && (
                    <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-[10px] font-bold">
                      {unreadCounts['group']}
                    </div>
                  )}
                </div>
              </div>
            )}

            {filteredMembers.length === 0 && searchQuery !== '' ? (
              <div className="p-4 text-center text-sm text-base-content/50">No contacts found.</div>
            ) : (
              filteredMembers.map(member => (
                <div 
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-base-100 last:border-none
                    ${selectedMember?.id === member.id ? 'bg-[#0092d1]/10' : 'hover:bg-base-50'}
                  `}
                >
                  <div className="w-12 h-12 rounded-full bg-[#0092d1]/20 text-[#0092d1] flex items-center justify-center font-bold text-lg shrink-0">
                    {(member.name || member.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="min-w-0 overflow-hidden">
                      <h3 className="font-semibold text-sm truncate text-base-content">{member.name || member.email}</h3>
                      <p className="text-xs text-base-content/60 truncate">
                        {selectedMember?.id === member.id ? 'Active chat' : 'Direct message'}
                      </p>
                    </div>
                    {unreadCounts[member.id] > 0 && (
                      <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-[10px] font-bold shrink-0 ml-2">
                        {unreadCounts[member.id]}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
