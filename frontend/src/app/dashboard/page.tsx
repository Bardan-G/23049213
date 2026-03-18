"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/axios";
import { Download, FileText } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      api.get('/orders', { headers: { Authorization: `Bearer ${session.accessToken}` } })
        .then(res => setOrders(res.data))
        .catch(console.error);
    }
  }, [session]);

  const handleDownloadInvoice = async (orderId: number) => {
    if (!session?.accessToken) return;
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        responseType: 'blob', // Important for handling binary data
      });

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice", error);
    }
  };

  if (status === "loading") return <div className="text-center mt-10">Loading...</div>;

  if (!session) return null;

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen bg-[#fdfbf7]">
      <h1 className="text-3xl font-serif font-bold text-[#3e2723] mb-8">Welcome, {session.user.name || session.user.email}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
            <p className="text-gray-600 mb-4">You are logged in as a <strong>{session.user.role}</strong>.</p>
            <p className="text-gray-500 text-sm">Email: {session.user.email}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[#3e2723]">Order History</h2>

          {orders.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 text-sm">
              No orders found.
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                  <div>
                    <p className="font-bold text-[#3e2723]">Order #{order.id}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="text-xs flex items-center gap-1 text-[#d4af37] hover:text-[#b08d2c] transition font-medium"
                    >
                      <Download size={14} /> Invoice
                    </button>
                    <p className="text-sm font-bold text-[#3e2723] mt-1">Rs. {Number(order.total).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img src={item.product?.imageUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-[#3e2723]">{item.product?.name || 'Product'}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        Rs. {Number(item.price).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
