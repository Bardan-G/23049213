'use client';
import { useCartStore, CartItem } from '@/store/useCartStore'; // 1. Import the Type
import Link from 'next/link';

export default function CartPage() {
  // 2. Added decreaseQuantity to the hook
  const { cart, removeFromCart, addToCart, decreaseQuantity, totalPrice } = useCartStore();

  // 3. Define the type for 'item' to fix the 'any' error
  const handleDecrease = (item: CartItem) => {
    decreaseQuantity(item.id);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white/50 text-white flex flex-col items-center justify-center p-10">
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/" className=" px-8 py-3 rounded-lg font-bold">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 mt-10 md:p-12">
      <h1 className="text-4xl font-bold mb-10">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item: CartItem) => ( // 4. Type the map item too
            <div key={item.id} className="bg-slate-300 border border-slate-700== p-4 rounded-xl flex items-center gap-6">
              <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-grow">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <p className="text-[#3e2723] font-bold">Rs. {item.price}</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-300 p-2 rounded-lg border border-amber-100">
                <button onClick={() => handleDecrease(item)} className="px-2 hover:text-red-500 text-xl">-</button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button onClick={() => addToCart(item)} className="px-2 hover:text-emerald-500 text-xl">+</button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-500">
              </button>
            </div>
          ))}
        </div>

        <div className="bg-slate-300 mt-10 p-10 rounded-2xl h-full border border-amber-100">
          <h2 className="text-2xl font-bold mb-6">Summary</h2>
          <div className="flex justify-between text-xl font-bold border-t border-t-amber-100 pt-4">
            <span>Total</span>
            <span>Rs. {totalPrice().toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="block w-full bg-amber-400 hover:bg-amber-500 py-4 rounded-xl mt-8 font-bold text-center">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}