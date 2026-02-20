"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartState, CartSummary, AddToCartInput } from "@/lib/types/cart";

interface CartStore extends CartState {
  // Actions
  addItem: (input: AddToCartInput) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => boolean;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  // Getters
  getSummary: () => CartSummary;
  getItemCount: () => number;
  hasItem: (productId: string, sizeId: string) => boolean;
}

const STORAGE_KEY = "ordoshop-cart-v1";

const initialState: Omit<CartState, "hasHydrated"> = {
  items: [],
  isOpen: false,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      hasHydrated: false,

      addItem: (input) => {
        const { items } = get();
        const id = `${input.productId}-${input.sizeId}`;

        const existingItem = items.find((item) => item.id === id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + (input.quantity || 1);
          if (newQuantity > input.maxStock) {
            return false;
          }

          set({
            items: items.map((item) =>
              item.id === id ? { ...item, quantity: newQuantity } : item,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id,
                productId: input.productId,
                productSlug: input.productSlug,
                name: input.name,
                sizeId: input.sizeId,
                sizeName: input.sizeName,
                price: input.price,
                quantity: input.quantity || 1,
                image: input.image,
                maxStock: input.maxStock,
              },
            ],
          });
        }

        return true;
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);

        if (!item) return false;

        if (quantity < 1) {
          get().removeItem(itemId);
          return true;
        }

        if (quantity > item.maxStock) {
          return false;
        }

        set({
          items: items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        });

        return true;
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getSummary: () => {
        const { items } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const itemCount = items.length;
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        return { subtotal, itemCount, totalItems };
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      hasItem: (productId, sizeId) => {
        const id = `${productId}-${sizeId}`;
        return get().items.some((item) => item.id === id);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
      skipHydration: true,
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.hasHydrated = true;
          }
        };
      },
    },
  ),
);

// Hook for hydration-aware rendering
export function useCartHydration(): boolean {
  return useCartStore((state) => state.hasHydrated);
}
