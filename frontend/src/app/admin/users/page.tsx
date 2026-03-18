'use client';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Shield, User as UserIcon } from "lucide-react";

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.accessToken) {
            api.get('/users/all', { // Assuming backend has this route, if not I'll need to create it
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            })
                .then(res => setUsers(res.data))
                .catch(err => {
                    console.error(err);
                    // Fallback mock data if API fails (so page doesn't crash while we build backend)
                    setUsers([]);
                })
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">User Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">ID</th>
                            <th className="p-4 font-medium text-gray-500">Name</th>
                            <th className="p-4 font-medium text-gray-500">Email</th>
                            <th className="p-4 font-medium text-gray-500">Role</th>
                            <th className="p-4 font-medium text-gray-500">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map(user => (
                            <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="p-4">{user.id}</td>
                                <td className="p-4 font-medium">{user.name}</td>
                                <td className="p-4 text-gray-500">{user.email}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-fit ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400 text-sm">
                                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">No users found or API not ready.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
