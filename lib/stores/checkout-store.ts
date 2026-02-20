"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerInfo, PaymentMethod } from "@/lib/types/checkout";

interface CheckoutState {
  customerInfo: CustomerInfo | null;
  paymentMethod: PaymentMethod | null;
  setCustomerInfo: (info: CustomerInfo) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      customerInfo: null,
      paymentMethod: null,
      setCustomerInfo: (info) => set({ customerInfo: info }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      clearCheckout: () => set({ customerInfo: null, paymentMethod: null }),
    }),
    {
      name: "ordoshop-checkout-v1",
    }
  )
);
