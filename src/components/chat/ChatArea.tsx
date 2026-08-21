'use client';

import { Video, Phone, Search, MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

interface ChatAreaProps {
  selectedMember: any;
  messages: any[];
  currentUser: any;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSendMessage: (text: string) => void;
}

export function ChatArea({
  selectedMember,
  messages,
  currentUser,
  messagesEndRef,
  onSendMessage
}: ChatAreaProps) {
  if (!selectedMember) {
    return (
      <div className="flex-1 flex flex-col bg-[#f0f2f5]">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f8fafc]">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-[#0092d1]/20">
            <MessageSquare size={48} />
          </div>
          <h2 className="text-2xl font-bold text-base-content mb-2">Coltask Chat</h2>
          <p className="text-base-content/60 max-w-md">
            Select a team member from the sidebar to start a conversation, or view the workspace history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f0f2f5]">
      {/* Chat Header */}
      <div className="h-16 px-6 flex items-center justify-between bg-white border-b border-base-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0092d1] text-white flex items-center justify-center font-bold shadow-sm">
            {(selectedMember.name || selectedMember.email || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-base-content leading-tight">{selectedMember.name || selectedMember.email}</h2>
            <p className="text-xs text-base-content/50">Workspace Chat</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-base-content/60">
          <button className="hover:text-[#0092d1] transition-colors"><Video size={20} /></button>
          <button className="hover:text-[#0092d1] transition-colors"><Phone size={20} /></button>
          <button className="hover:text-[#0092d1] transition-colors border-l border-base-200 pl-4 ml-2"><Search size={20} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(msg => {
          const isMe = msg.sender?.id === currentUser?.id || msg.sender === currentUser?.id;
          
          let isRead = false;
          if (msg.readBy && Array.isArray(msg.readBy)) {
            if (selectedMember.id === 'group') {
              // Group message is "read" if at least one other person read it
              isRead = msg.readBy.some((id: string) => id !== currentUser?.id);
            } else {
              // Direct message is "read" if the recipient read it
              isRead = msg.readBy.includes(selectedMember.id);
            }
          }
          let senderName;
          if (!isMe && selectedMember.id === 'group') {
            senderName = msg.sender?.name || msg.sender?.email || 'Unknown User';
          }

          return <MessageBubble key={msg.id || msg.id} msg={msg} isMe={isMe} isRead={isRead} senderName={senderName} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
