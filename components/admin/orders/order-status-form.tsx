"use client";

import { useState } from "react";
import { updateOrderStatus, shipOrder } from "@/lib/actions/orders";
import { useRouter } from "next/navigation";
import { OrderStatus } from "./order-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PackageCheck, Truck, CheckCircle, ClipboardCheck } from "lucide-react";

interface Courier {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: OrderStatus;
  trackingNumber?: string | null;
  courier?: string | null;
  couriers?: Courier[];
}

export function OrderStatusForm({
  orderId,
  currentStatus,
  trackingNumber,
  courier,
  couriers = [],
}: OrderStatusFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [waybill, setWaybill] = useState(trackingNumber || "");
  const [selectedCourierId, setSelectedCourierId] = useState("");

  const activeCouriers = couriers.filter((c) => c.isActive);

  const handleStatusUpdate = async (
    newStatus: "PROCESSING" | "DELIVERED" | "COMPLETED",
  ) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShipOrder = async () => {
    if (!waybill.trim()) {
      toast.error("Please enter a tracking/waybill number");
      return;
    }
    if (!selectedCourierId) {
      toast.error("Please select a courier");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await shipOrder(orderId, waybill, selectedCourierId);
      if (res.success) {
        toast.success("Order shipped successfully!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to ship order");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  // PAID → show "Process Order" button
  if (currentStatus === "PAID") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Payment confirmed. Start processing this order.
        </p>
        <Button
          onClick={() => handleStatusUpdate("PROCESSING")}
          disabled={isUpdating}
          className="w-full"
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          {isUpdating ? "Processing..." : "Process Order"}
        </Button>
      </div>
    );
  }

  // PROCESSING → show waybill + courier form
  if (currentStatus === "PROCESSING") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter shipping details to mark this order as shipped.
        </p>
        <div className="space-y-2">
          <Label htmlFor="waybill">Tracking / Waybill Number</Label>
          <Input
            id="waybill"
            placeholder="e.g. JNE1234567890"
            value={waybill}
            onChange={(e) => setWaybill(e.target.value)}
            disabled={isUpdating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courier">Courier</Label>
          <Select
            value={selectedCourierId}
            onValueChange={setSelectedCourierId}
            disabled={isUpdating}
          >
            <SelectTrigger id="courier" className="bg-white">
              <SelectValue placeholder="Select courier" />
            </SelectTrigger>
            <SelectContent>
              {activeCouriers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name.toUpperCase()} ({c.code.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleShipOrder}
          disabled={isUpdating || !waybill.trim() || !selectedCourierId}
          className="w-full"
        >
          <Truck className="w-4 h-4 mr-2" />
          {isUpdating ? "Shipping..." : "Ship Order"}
        </Button>
      </div>
    );
  }

  // SHIPPED → show "Mark as Delivered" button
  if (currentStatus === "SHIPPED") {
    return (
      <div className="space-y-3">
        {trackingNumber && (
          <div className="text-sm bg-muted/50 p-3 rounded-md space-y-1">
            <p>
              <span className="text-muted-foreground">Courier:</span>{" "}
              <strong>{courier?.toUpperCase()}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Tracking:</span>{" "}
              <strong>{trackingNumber}</strong>
            </p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Confirm that the customer has received this order.
        </p>
        <Button
          onClick={() => handleStatusUpdate("DELIVERED")}
          disabled={isUpdating}
          className="w-full"
        >
          <PackageCheck className="w-4 h-4 mr-2" />
          {isUpdating ? "Updating..." : "Mark as Delivered"}
        </Button>
      </div>
    );
  }

  // DELIVERED → show "Complete Order" button
  if (currentStatus === "DELIVERED") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Finalize and complete this order.
        </p>
        <Button
          onClick={() => handleStatusUpdate("COMPLETED")}
          disabled={isUpdating}
          className="w-full"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isUpdating ? "Completing..." : "Complete Order"}
        </Button>
      </div>
    );
  }

  // PENDING, EXPIRED, COMPLETED — no actions
  return (
    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
      {currentStatus === "COMPLETED" ? (
        <p>This order has been completed. No further actions available.</p>
      ) : (
        <p>
          No actions available. Current status: <strong>{currentStatus}</strong>
          .
        </p>
      )}
    </div>
  );
}
