import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sweet, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (sweet: Sweet, quantity?: number) => void;
  removeItem: (sweetId: string) => void;
  updateQuantity: (sweetId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.sweet.price * item.quantity, 0);
  return { totalItems, totalAmount };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addItem: (sweet, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((item) => item.sweet._id === sweet._id);

        let newItems: CartItem[];

        if (existingIndex > -1) {
          newItems = items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: Math.min(item.quantity + quantity, sweet.quantity) }
              : item
          );
        } else {
          newItems = [...items, { sweet, quantity: Math.min(quantity, sweet.quantity) }];
        }

        set({
          items: newItems,
          ...calculateTotals(newItems),
        });
      },

      removeItem: (sweetId) => {
        const { items } = get();
        const newItems = items.filter((item) => item.sweet._id !== sweetId);
        set({
          items: newItems,
          ...calculateTotals(newItems),
        });
      },

      updateQuantity: (sweetId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          const newItems = items.filter((item) => item.sweet._id !== sweetId);
          set({
            items: newItems,
            ...calculateTotals(newItems),
          });
          return;
        }

        const newItems = items.map((item) =>
          item.sweet._id === sweetId
            ? { ...item, quantity: Math.min(quantity, item.sweet.quantity) }
            : item
        );

        set({
          items: newItems,
          ...calculateTotals(newItems),
        });
      },

      clearCart: () =>
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
