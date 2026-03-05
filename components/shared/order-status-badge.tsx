import { Badge } from "@/components/ui/badge";

export type OrderStatus =
  | "PENDING"
  | "EXPIRED"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  let className = "";
  switch (status) {
    case "PENDING":
      className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      break;
    case "EXPIRED":
      className = "bg-red-100 text-red-800 hover:bg-red-100";
      break;
    case "PAID":
      className = "bg-green-100 text-green-800 hover:bg-green-100";
      break;
    case "PROCESSING":
      className = "bg-blue-100 text-blue-800 hover:bg-blue-100";
      break;
    case "SHIPPED":
      className = "bg-purple-100 text-purple-800 hover:bg-purple-100";
      break;
    case "DELIVERED":
      className = "bg-teal-100 text-teal-800 hover:bg-teal-100";
      break;
    case "COMPLETED":
      className = "bg-slate-800 text-white hover:bg-slate-800";
      break;
    default:
      className = "bg-slate-100 text-slate-800 hover:bg-slate-100";
      break;
  }

  return (
    <Badge className={className} variant="outline">
      {status}
    </Badge>
  );
}
