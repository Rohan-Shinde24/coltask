'use client';

import { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSendMessage(message);
    setMessage('');
  };

  return (
    <div className="p-4 bg-[#f0f2f5] shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white rounded-full pr-2 pl-4 py-2 shadow-sm border border-base-200 focus-within:border-[#0092d1] focus-within:ring-1 focus-within:ring-[#0092d1] transition-all">
        <button type="button" disabled={disabled} className="text-base-content/40 hover:text-[#0092d1] transition-colors p-2 disabled:opacity-50">
          <Paperclip size={20} />
        </button>
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm py-2 disabled:bg-transparent"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
        />
        <button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="w-10 h-10 rounded-full bg-[#0092d1] text-white flex items-center justify-center disabled:opacity-50 disabled:bg-base-300 disabled:text-base-content/40 transition-colors hover:bg-[#007ba8]"
        >
          <Send size={18} className="ml-1" />
        </button>
      </form>
    </div>
  );
}
