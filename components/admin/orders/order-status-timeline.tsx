import { Check } from "lucide-react";
import { OrderStatus } from "./order-status-badge";
import { cn } from "@/lib/utils";

const FULFILLMENT_STEPS: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

function getStepIndex(status: OrderStatus): number {
  return FULFILLMENT_STEPS.indexOf(status);
}

export function OrderStatusTimeline({
  currentStatus,
}: {
  currentStatus: OrderStatus;
}) {
  // Non-fulfillment statuses
  if (currentStatus === "PENDING") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        Waiting for payment confirmation
      </div>
    );
  }

  if (currentStatus === "EXPIRED") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
        Payment expired
      </div>
    );
  }

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="rounded-lg border bg-white p-4 md:p-6">
      <div className="flex items-center justify-between">
        {FULFILLMENT_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isDone && "border-green-500 bg-green-500 text-white",
                    isCurrent &&
                      "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200",
                    isUpcoming &&
                      "border-muted-foreground/30 bg-muted/50 text-muted-foreground/50",
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    isDone && "text-green-700",
                    isCurrent && "text-blue-700 font-semibold",
                    isUpcoming && "text-muted-foreground/50",
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {index < FULFILLMENT_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full",
                    index < currentIndex
                      ? "bg-green-500"
                      : "bg-muted-foreground/20",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
