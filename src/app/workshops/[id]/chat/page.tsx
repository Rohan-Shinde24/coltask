'use client';

import { use, useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { ChatMemberList } from '@/components/chat/ChatMemberList';
import { ChatArea } from '@/components/chat/ChatArea';
import { encryptMessage, decryptMessage } from '@/lib/encryption';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedMember, setSelectedMember] = useState<any>({ id: 'group', name: 'Project Group Chat' });
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, workshopRes, chatRes] = await Promise.all([
          axios.get('/api/auth/me'),
          axios.get(`/api/workshops/${id}`),
          axios.get(`/api/workshops/${id}/chat`)
        ]);
        
        const me = meRes.data.user;
        setCurrentUser(me);
        
        // Filter out current user from the contact list
        const otherMembers = workshopRes.data.workshop.members
          .map((m: any) => m.user)
          .filter((u: any) => u.id !== me.id);
        setMembers(otherMembers);

        // Decrypt historical messages
        const encryptedHistory = chatRes.data.messages || [];
        const decryptedHistory = await Promise.all(
          encryptedHistory.map(async (msg: any) => {
            const isGroup = !msg.recipient;
            let text = '';
            if (isGroup) {
              text = await decryptMessage(msg.ciphertext, msg.iv, id);
            } else {
              // For direct messages, pass sender and recipient
              const senderId = msg.sender.id || msg.sender;
              const recipientId = msg.recipient;
              text = await decryptMessage(msg.ciphertext, msg.iv, id, recipientId, senderId);
            }
            return { ...msg, text };
          })
        );
        setMessages(decryptedHistory);
        
      } catch (err) {
        console.error('Error fetching chat data', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!currentUser) return;

    // Initialize Socket.io connection
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat server');
      socket.emit('join_workspace', id);
      socket.emit('join_user', currentUser.id);
    });

    socket.on('receive_message', async (encryptedMsg: any) => {
      // Decrypt incoming message
      const isGroup = !encryptedMsg.recipient;
      let text = '';
      if (isGroup) {
        text = await decryptMessage(encryptedMsg.ciphertext, encryptedMsg.iv, id);
      } else {
        const senderId = encryptedMsg.sender.id || encryptedMsg.sender;
        const recipientId = encryptedMsg.recipient;
        text = await decryptMessage(encryptedMsg.ciphertext, encryptedMsg.iv, id, recipientId, senderId);
      }
      
      const decryptedMsg = { ...encryptedMsg, text };
      setMessages(prev => [...prev, decryptedMsg]);
    });

    socket.on('read_receipt', (data: { messageIds: string[], readerId: string }) => {
      setMessages(prev => prev.map(msg => {
        if (data.messageIds.includes(msg.id)) {
          const currentReadBy = Array.isArray(msg.readBy) ? msg.readBy : [];
          if (!currentReadBy.includes(data.readerId)) {
            return { ...msg, readBy: [...currentReadBy, data.readerId] };
          }
        }
        return msg;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [id, currentUser]);

  // Handle Mark As Read logic when selecting a chat
  useEffect(() => {
    if (!selectedMember || !currentUser || messages.length === 0) return;

    const unreadMessageIds = messages
      .filter(msg => {
        // Is it for the current selected chat?
        const isGroupMsg = !msg.recipient;
        const isCurrentChat = selectedMember.id === 'group' 
          ? isGroupMsg 
          : (!isGroupMsg && (msg.sender?.id === selectedMember.id || msg.recipient === selectedMember.id));
        
        if (!isCurrentChat) return false;
        
        // Did I NOT read it yet?
        const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
        return !readBy.includes(currentUser.id);
      })
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      // Mark as read in DB
      axios.put(`/api/workshops/${id}/chat/read`, { messageIds: unreadMessageIds })
        .then(() => {
          // Update local state
          setMessages(prev => prev.map(msg => {
            if (unreadMessageIds.includes(msg.id)) {
              const currentReadBy = Array.isArray(msg.readBy) ? msg.readBy : [];
              return { ...msg, readBy: [...currentReadBy, currentUser.id] };
            }
            return msg;
          }));

          // Tell sender via socket
          const firstUnreadMsg = messages.find(m => m.id === unreadMessageIds[0]);
          socketRef.current?.emit('messages_read', {
            workshopId: id,
            senderId: selectedMember.id === 'group' ? null : firstUnreadMsg?.sender?.id,
            messageIds: unreadMessageIds,
            readerId: currentUser.id
          });
        })
        .catch(err => console.error('Failed to mark messages as read', err));
    }
  }, [selectedMember, messages, currentUser, id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Compute Unread Counts
  const unreadCounts = useMemo(() => {
    const counts: Record<string, number> = { group: 0 };
    if (!currentUser) return counts;

    members.forEach(m => counts[m.id] = 0);

    messages.forEach(msg => {
      const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
      if (!readBy.includes(currentUser.id)) {
        if (!msg.recipient) {
          counts['group']++;
        } else {
          // If it's a DM sent to me
          if (msg.recipient === currentUser.id) {
            const senderId = msg.sender?.id || msg.sender;
            if (counts[senderId] !== undefined) {
              counts[senderId]++;
            }
          }
        }
      }
    });
    return counts;
  }, [messages, currentUser, members]);

  // Filter messages for active chat
  const activeMessages = useMemo(() => {
    if (!selectedMember) return [];
    if (selectedMember.id === 'group') {
      return messages.filter(m => !m.recipient);
    }
    return messages.filter(m => 
      m.recipient === selectedMember.id || 
      (m.sender?.id === selectedMember.id && m.recipient === currentUser?.id)
    );
  }, [messages, selectedMember, currentUser]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUser || !selectedMember) return;
    
    const isGroup = selectedMember.id === 'group';
    const recipientId = isGroup ? undefined : selectedMember.id;

    // Encrypt the message before sending
    const { ciphertext, iv } = await encryptMessage(text, id, recipientId, currentUser.id);

    // Save to database
    try {
      const payload = { ciphertext, iv, recipient: recipientId };
      const res = await axios.post(`/api/workshops/${id}/chat`, payload);
      const savedMsg = res.data.message;
      
      // Emit to socket
      socketRef.current?.emit('send_message', { 
        workshopId: id, 
        message: savedMsg,
        recipientId
      });

      // Optimistically add to local state
      setMessages(prev => [...prev, { ...savedMsg, text }]);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      <ChatMemberList 
        members={members}
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        unreadCounts={unreadCounts}
      />
      <ChatArea 
        selectedMember={selectedMember}
        messages={activeMessages}
        currentUser={currentUser}
        messagesEndRef={messagesEndRef}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
