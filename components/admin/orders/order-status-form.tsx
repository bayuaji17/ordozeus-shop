"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import { useRouter } from "next/navigation";
import { OrderStatus } from "./order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const AVAILABLE_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

export function OrderStatusForm({
  orderId,
  currentStatus,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);

  const isUpdatable = AVAILABLE_STATUSES.includes(currentStatus);

  if (!isUpdatable) {
    return (
      <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md border">
        Manual updates disabled. Waiting for payment. Current Status:{" "}
        <strong>{currentStatus}</strong>.
      </div>
    );
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatus(orderId, selectedStatus);
      if (res.success) {
        alert("Order status updated successfully!");
        router.refresh();
      } else {
        alert(res.message || "Failed to update status");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Select
        value={selectedStatus}
        onValueChange={(val) => setSelectedStatus(val as OrderStatus)}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleUpdate}
        disabled={isUpdating || selectedStatus === currentStatus}
        variant="secondary"
      >
        {isUpdating ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
}
