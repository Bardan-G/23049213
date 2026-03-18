'use client';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Check, Clock, Truck, XCircle } from "lucide-react";

export default function AdminOrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
        api.get('/orders/all', {
            headers: { Authorization: `Bearer ${session?.accessToken}` }
        })
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (session?.accessToken) {
            fetchOrders();
        }
    }, [session]);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            fetchOrders();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Order ID</th>
                            <th className="p-4 font-medium text-gray-500">Customer</th>
                            <th className="p-4 font-medium text-gray-500">Items</th>
                            <th className="p-4 font-medium text-gray-500">Total</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="p-4">#{order.id}</td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{order.user.name}</div>
                                    <div className="text-xs text-gray-500">{order.user.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2 -space-x-2">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden relative group" title={`${item.product?.name} (x${item.quantity})`}>
                                                <img src={item.product?.imageUrl} alt="" className="w-full h-full object-cover" />
                                                <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[8px] px-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">{order.items.length} unique items</p>
                                </td>
                                <td className="p-4 font-bold text-emerald-600">Rs. {Number(order.total).toLocaleString()}</td>
                                <td className="p-4">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(order.id, 'processing')} className="p-2 hover:bg-blue-50 text-blue-600 rounded" title="Mark Processing">
                                            <Clock size={16} />
                                        </button>
                                        <button onClick={() => updateStatus(order.id, 'shipped')} className="p-2 hover:bg-orange-50 text-orange-600 rounded" title="Mark Shipped">
                                            <Truck size={16} />
                                        </button>
                                        <button onClick={() => updateStatus(order.id, 'delivered')} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded" title="Mark Delivered">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => updateStatus(order.id, 'cancelled')} className="p-2 hover:bg-red-50 text-red-600 rounded" title="Cancel">
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        pending: "bg-yellow-100 text-yellow-800",
        processing: "bg-blue-100 text-blue-800",
        shipped: "bg-orange-100 text-orange-800",
        delivered: "bg-emerald-100 text-emerald-800",
        cancelled: "bg-red-100 text-red-800",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || "bg-gray-100"}`}>
            {status}
        </span>
    );
}
