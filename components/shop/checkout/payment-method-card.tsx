"use client";

import { cn } from "@/lib/utils";
import { Building2, CreditCard } from "lucide-react";
import type { PaymentMethod } from "@/lib/types/checkout";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

const PAYMENT_METHODS = {
  bank_transfer: {
    icon: Building2,
    title: "Bank Transfer",
    description: "BCA, BNI, Mandiri",
    note: "Manual verification",
  },
  midtrans: {
    icon: CreditCard,
    title: "Midtrans",
    description: "Credit/Debit Card, E-wallet, QRIS, VA",
    note: "Online payment",
  },
};

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: PaymentMethodCardProps) {
  const config = PAYMENT_METHODS[method];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
        selected
          ? "border-black bg-black/5"
          : "border-slate-200 hover:border-slate-300 bg-white"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
          selected ? "bg-black text-white" : "bg-slate-100 text-slate-600"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-slate-900">{config.title}</p>
        <p className="text-sm text-slate-500">{config.description}</p>
      </div>

      <div className="text-right">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full",
            selected
              ? "bg-black text-white"
              : "bg-slate-100 text-slate-600"
          )}
        >
          {config.note}
        </span>
      </div>
    </button>
  );
}
