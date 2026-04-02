'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useChatStore } from '@/store/useChatStore';
import { MessageSquare, X, Send } from 'lucide-react';

export default function LiveChats() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        connect,
        disconnect,
        messages,
        adminId,
        fetchAdminId,
        sendMessage,
        unreadCount,
        clearUnread,
        setActiveChat
    } = useChatStore();

    // 1. Fetch Admin ID once on mount if customer
    useEffect(() => {
        if (session?.accessToken && session?.user?.role !== 'admin') {
            fetchAdminId(session.accessToken);
        }
    }, [session?.accessToken, session?.user?.role]);

    // 1.5. Set active chat automatically once adminId is fetched, so history and messages load
    useEffect(() => {
        if (adminId && session?.accessToken && session?.user?.role !== 'admin') {
            setActiveChat(session.accessToken, adminId);
        }
    }, [adminId, session?.accessToken, session?.user?.role]);

    // 2. Connect to WebSocket if logged in as a customer
    useEffect(() => {
        if (session?.accessToken && session?.user?.role !== 'admin') {
            connect(session.accessToken);
        }
    }, [session?.accessToken, session?.user?.role]); 

    // 3. Auto-scroll to bottom of messages
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // 4. Clear unread count when opening the chat
    useEffect(() => {
        if (isOpen) {
            clearUnread();
        }
    }, [isOpen, clearUnread, messages.length]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !adminId) return;

        sendMessage(adminId, input);
        setInput('');
    };

    // Do not render for admins or unauthenticated users
    if (!session || session?.user?.role === 'admin') {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl mb-4 overflow-hidden border border-gray-100 flex flex-col h-[500px] max-h-[70vh]">
                    {/* Header */}
                    <div className="bg-[#3E2723] text-white p-4 flex justify-between items-center shadow-md z-10">
                        <div>
                            <h3 className="font-serif font-bold text-lg">Live Support</h3>
                            <p className="text-xs text-white/70">We usually reply instantly</p>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA] flex flex-col gap-3">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <MessageSquare size={48} className="mb-2" />
                                <p className="text-sm">No messages yet.<br/>Send a message to start chatting with support.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === Number(session?.user?.id);
                                return (
                                    <div 
                                        key={idx} 
                                        className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                                    >
                                        <div 
                                            className={`px-4 py-2 rounded-2xl ${
                                                isMe 
                                                ? 'bg-[#3E2723] text-white rounded-br-none' 
                                                : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-none'
                                            }`}
                                        >
                                            <p className="text-sm break-words">{msg.content}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend(e);
                            }}
                            placeholder="Type your message..."
                            className="flex-1 bg-[#FAFAFA] border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="bg-[#D4AF37] text-white p-2 rounded-full hover:bg-[#b08e26] transition-colors disabled:opacity-50 disabled:hover:bg-[#D4AF37] flex items-center justify-center min-w-[40px]"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 bg-[#3E2723] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-300 relative ${isOpen ? 'rotate-90 opacity-0 pointer-events-none' : 'rotate-0 opacity-100'} absolute bottom-0 right-0`}
            >
                <MessageSquare size={24} />
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#fdfbf7]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            <button
                onClick={() => setIsOpen(false)}
                className={`w-14 h-14 bg-[#3E2723] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-300 absolute bottom-0 right-0 ${!isOpen ? '-rotate-90 opacity-0 pointer-events-none' : 'rotate-0 opacity-100'}`}
            >
                <X size={24} />
            </button>
        </div>
    );
}
