import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  syncCart: (token: string) => Promise<void>;
  fetchCart: (token: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: async (product) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.id === product.id);
        let newCart;

        if (existingItem) {
          newCart = currentCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          newCart = [...currentCart, { ...product, quantity: 1 }];
        }

        set({ cart: newCart });

        // We can optionally sync here if we have a token, but usually 
        // managing token inside store is complex. 
        // Better to call syncCart from component when cart changes if logged in.
      },

      decreaseQuantity: (productId) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.id === productId);

        let newCart;
        if (existingItem && existingItem.quantity > 1) {
          newCart = currentCart.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
          );
        } else {
          newCart = currentCart.filter((item) => item.id !== productId);
        }
        set({ cart: newCart });
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.id !== productId) });
      },

      clearCart: () => set({ cart: [] }),

      totalPrice: () => {
        return get().cart.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
      },

      syncCart: async (token: string) => {
        const cart = get().cart;
        const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
        try {
          await api.post('/cart/sync', { items }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      },

      fetchCart: async (token: string) => {
        try {
          const res = await api.get('/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Backend returns cartItems with product relation
          const serverCart = res.data.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            quantity: item.quantity
          }));
          set({ cart: serverCart });
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        }
      }
    }),
    { name: 'shopping-cart' }
  )
);