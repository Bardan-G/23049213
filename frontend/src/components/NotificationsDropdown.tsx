'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function NotificationsDropdown() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const prevUnreadCountRef = useRef(0);

    useEffect(() => {
        if (session?.accessToken) {
            fetchNotifications();
            // Optional: poll every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications', {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            const data = res.data;
            setNotifications(data);

            const currentUnreadCount = data.filter((n: any) => !n.isRead).length;
            if (currentUnreadCount > prevUnreadCountRef.current) {
                toast("You have new unread notifications", {
                    icon: '🔔',
                    duration: 4000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            }
            prevUnreadCountRef.current = currentUnreadCount;

        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!session) return null;

    return (
        <div className="relative">
            <button
                className="hover:text-[#D4AF37] transition-colors relative mt-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} strokeWidth={1.5} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-80 bg-white shadow-xl rounded-sm border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                        <p className="text-xs font-bold text-[#3E2723]">Notifications</p>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400">No new notifications</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notif) => (
                                <div key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-orange-50/30' : ''}`}>
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <h4 className="text-xs font-bold text-[#3e2723]">{notif.title}</h4>
                                        {!notif.isRead && (
                                            <button onClick={() => markAsRead(notif.id)} className="text-[#D4AF37] hover:text-[#3e2723] flex-shrink-0" title="Mark as read">
                                                <CheckCircle2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-snug mb-2">{notif.message}</p>
                                    <p className="text-[9px] text-gray-400">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
