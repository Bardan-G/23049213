'use client';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.accessToken) {
            api.get('/admin/stats', {
                headers: { Authorization: `Bearer ${session.accessToken}` }
            })
                .then(res => setStats(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value={`Rs. ${Number(stats?.revenue || 0).toLocaleString()}`} icon={<DollarSign size={24} className="text-emerald-500" />} />
                <StatCard title="Total Orders" value={stats?.orders || 0} icon={<ShoppingBag size={24} className="text-blue-500" />} />
                <StatCard title="Total Products" value={stats?.products || 0} icon={<Package size={24} className="text-purple-500" />} />
                <StatCard title="Total Users" value={stats?.users || 0} icon={<Users size={24} className="text-orange-500" />} />
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Revenue (Last 7 Days)</h2>
                <div className="h-[300px] w-full">
                    {stats?.salesData?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <Line type="monotone" dataKey="amount" stroke="#d4af37" strokeWidth={3} dot={{ r: 4, fill: '#d4af37' }} activeDot={{ r: 6 }} />
                                <CartesianGrid stroke="#f5f5f5" strokeDasharray="5 5" />
                                <XAxis dataKey="date" stroke="#8884d8" fontSize={12} tickMargin={10} />
                                <YAxis stroke="#8884d8" fontSize={12} tickFormatter={(value) => `Rs.${value}`} />
                                <Tooltip
                                    formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No sales data available for the last 7 days.
                        </div>
                    )}
                </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Low Stock Alerts</h2>
                {stats?.lowStock?.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 border-b">
                                <th className="pb-2">Product</th>
                                <th className="pb-2">Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.lowStock.map((p: any) => (
                                <tr key={p.id} className="border-b last:border-0">
                                    <td className="py-2 text-red-600 font-medium">{p.name}</td>
                                    <td className="py-2 font-bold">{p.stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500">No low stock items.</p>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                {icon}
            </div>
        </div>
    );
}
