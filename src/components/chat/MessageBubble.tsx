'use client';

import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  msg: any;
  isMe: boolean;
  isRead: boolean; // Computed from msg.readBy array
  senderName?: string;
}

export function MessageBubble({ msg, isMe, isRead, senderName }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2`}>
      {!isMe && senderName && (
        <div className="flex items-center gap-1.5 ml-1 mb-1">
          <div className="w-5 h-5 rounded-full bg-[#0092d1] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
            {senderName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-base-content/60">{senderName}</span>
        </div>
      )}
      <div 
        className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
          isMe 
            ? 'bg-[#0092d1] text-white rounded-br-sm' 
            : 'bg-white text-base-content rounded-bl-sm border border-base-200'
        }`}
      >
        <p className="text-sm">{msg.text}</p>
      </div>
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[10px] text-base-content/40">
          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isMe && (
          isRead ? (
            <CheckCheck size={14} className="text-[#34B7F1]" /> // WhatsApp style double blue tick
          ) : (
            <Check size={14} className="text-base-content/40" /> // Single gray tick
          )
        )}
      </div>
    </div>
  );
}
