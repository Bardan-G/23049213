import { create } from 'zustand';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import api from '@/lib/axios';

export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: string;
    sender?: {
        id: number;
        name: string;
        role: string;
    };
}

interface ChatState {
    socket: Socket | null;
    messages: ChatMessage[];
    isConnected: boolean;
    activeChatUserId: number | null;
    adminId: number | null;
    unreadCount: number;

    // Actions
    connect: (token: string) => void;
    disconnect: () => void;
    setActiveChat: (token: string, userId: number | null) => void;
    fetchAdminId: (token: string) => Promise<void>;
    fetchHistory: (token: string, otherUserId: number) => Promise<void>;
    sendMessage: (receiverId: number, content: string) => void;
    addMessage: (message: ChatMessage) => void;
    clearUnread: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    socket: null,
    messages: [],
    isConnected: false,
    activeChatUserId: null,
    adminId: null,
    unreadCount: 0,

    connect: (token: string) => {
        const { socket } = get();
        // If we already have a socket and it's connected, don't do anything
        if (socket && socket.connected) return;

        // If we have a socket but it's disconnected, just reconnect it
        if (socket && !socket.connected) {
            socket.io.opts.query = { token };
            socket.connect();
            return;
        }

        // Connect to the backend WebSocket
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
            query: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        set({ socket: newSocket });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
            set({ isConnected: true });
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false });
        });

        newSocket.on('newMessage', (message: ChatMessage) => {
            const { activeChatUserId, adminId } = get();

            const isFromAdmin = message.sender?.role === 'admin' || String(message.senderId) === String(adminId);
            const isChattingWithAdmin = String(activeChatUserId) === String(adminId);

            // Only add to current messages if it belongs to the active chat explicitly,
            // OR if the active chat is the admin support channel, accept it from ANY admin.
            if (
                String(activeChatUserId) === String(message.senderId) ||
                String(activeChatUserId) === String(message.receiverId) ||
                (isChattingWithAdmin && isFromAdmin)
            ) {
                set((state) => ({ messages: [...state.messages, message] }));
            } else {
                // Increment unread count if it's from someone else
                set((state) => ({ unreadCount: state.unreadCount + 1 }));
            }
        });

        newSocket.on('messageSent', (message: ChatMessage) => {
            // Message successfully sent and stored in DB
            set((state) => ({ messages: [...state.messages, message] }));
        });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            // Don't set socket to null here, just let it disconnect. 
            // Setting to null destroys the instance and forces complete recreation on next render.
            // set({ socket: null, isConnected: false, messages: [], activeChatUserId: null });
            set({ isConnected: false });
        }
    },

    setActiveChat: (token: string, userId: number | null) => {
        set({ activeChatUserId: userId });
        if (userId) {
            get().fetchHistory(token, userId);
        }
    },

    fetchAdminId: async (token: string) => {
        try {
            const res = await api.get('/chat/admin-id', {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ adminId: res.data.adminId });
        } catch (error) {
            console.error("Failed to fetch admin ID", error);
        }
    },

    fetchHistory: async (token: string, otherUserId: number) => {
        try {
            const res = await api.get(`/chat/history/${otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ messages: res.data });
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        }
    },

    sendMessage: (receiverId: number, content: string) => {
        const { socket } = get();
        if (socket && socket.connected) {
            socket.emit('sendMessage', { receiverId, content });
        } else {
            console.error("Socket not connected");
        }
    },

    addMessage: (message: ChatMessage) => {
        set((state) => ({ messages: [...state.messages, message] }));
    },

    clearUnread: () => {
        set({ unreadCount: 0 });
    }
}));
