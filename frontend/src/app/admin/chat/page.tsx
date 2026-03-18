'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useChatStore } from "@/store/useChatStore";
import api from "@/lib/axios";
import { MessageCircle, Send, User } from "lucide-react";

export default function AdminChatPage() {
    const { data: session } = useSession();
    const [activeChats, setActiveChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        connect,
        disconnect,
        messages,
        activeChatUserId,
        setActiveChat,
        sendMessage,
    } = useChatStore();

    useEffect(() => {
        if (session?.accessToken && session.user.role === 'admin') {
            connect(session.accessToken);
            fetchActiveChats();
            return () => {
                disconnect();
            };
        }
    }, [session?.accessToken, session?.user?.role, connect, disconnect]);

    const fetchActiveChats = async () => {
        try {
            const res = await api.get('/chat/active-chats', {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            setActiveChats(res.data);
        } catch (error) {
            console.error("Failed to fetch active chats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeChatUserId]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChatUserId) return;

        sendMessage(activeChatUserId, messageInput);
        setMessageInput("");
    };

    if (loading) return <div>Loading chats...</div>;

    const activeUser = activeChats.find(c => c.id === activeChatUserId);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden h-[calc(100vh-120px)]">
            {/* Sidebar with active chats */}
            <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="font-bold text-lg text-gray-800">Active Conversations</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {activeChats.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm mt-10">
                            No active conversations yet.
                        </div>
                    ) : (
                        activeChats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChat(chat.id)}
                                className={`w-full text-left p-4 border-b border-gray-100 transition flex items-center gap-3 ${activeChatUserId === chat.id ? 'bg-blue-50 border-blue-100' : 'hover:bg-white'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-semibold text-gray-800 truncate">{chat.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{chat.email}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#fdfbf7]">
                {activeChatUserId ? (
                    <>
                        {/* Header */}
                        <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{activeUser?.name || 'Customer'}</h3>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
                                    <MessageCircle size={48} className="mb-2 opacity-20" />
                                    <p>No messages yet.</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === Number(session?.user?.id);
                                    return (
                                        <div
                                            key={msg.id || idx}
                                            className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm flex flex-col ${isMe
                                                ? "bg-[#3e2723] text-white rounded-br-sm self-end"
                                                : "bg-white border border-gray-200 shadow-sm text-gray-800 rounded-bl-sm self-start"
                                                }`}
                                        >
                                            <span>{msg.content}</span>
                                            <span className={`text-[10px] mt-2 self-end ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm text-gray-800"
                            />
                            <button
                                type="submit"
                                disabled={!messageInput.trim()}
                                className="w-12 h-12 rounded-full bg-[#3e2723] hover:bg-[#2a1a17] text-[#d4af37] flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                <Send size={20} className="ml-1" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle size={64} className="mb-4 opacity-20" />
                        <h2 className="text-xl font-medium text-gray-600">Select a conversation</h2>
                        <p className="text-sm mt-2">Choose an active chat from the sidebar to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
