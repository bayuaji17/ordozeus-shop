"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerInfo, PaymentMethod } from "@/lib/types/checkout";

interface CheckoutState {
  customerInfo: CustomerInfo | null;
  paymentMethod: PaymentMethod | null;
  shippingCost: number | null;
  setCustomerInfo: (info: CustomerInfo) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setShipping: (cost: number | null) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      customerInfo: null,
      paymentMethod: null,
      shippingCost: null,
      setCustomerInfo: (info) => set({ customerInfo: info }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setShipping: (cost) => set({ shippingCost: cost }),
      clearCheckout: () =>
        set({ customerInfo: null, paymentMethod: null, shippingCost: null }),
    }),
    {
      name: "ordoshop-checkout-v1",
    }
  )
);
