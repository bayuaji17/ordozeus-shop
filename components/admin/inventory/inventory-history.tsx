import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InventoryMovement {
  id: string;
  productId: string;
  productSizeId: string | null;
  type: "in" | "out" | "adjust";
  quantity: number;
  reason: string | null;
  createdAt: Date;
  productName: string | null;
  sizeName: string | null;
  sku: string | null;
}

interface InventoryHistoryProps {
  movements: InventoryMovement[];
}

function getTypeBadge(type: string) {
  switch (type) {
    case "in":
      return (
        <Badge
          variant="default"
          className="bg-green-500/10 text-green-700 dark:text-green-400"
        >
          Stock In
        </Badge>
      );
    case "out":
      return (
        <Badge
          variant="default"
          className="bg-red-500/10 text-red-700 dark:text-red-400"
        >
          Stock Out
        </Badge>
      );
    case "adjust":
      return (
        <Badge
          variant="default"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-400"
        >
          Adjustment
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export function InventoryHistory({ movements }: InventoryHistoryProps) {
  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            No inventory movements recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Inventory Movements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeBadge(movement.type)}
                  <span className="text-sm font-medium">
                    {movement.productName}
                    {movement.sizeName && (
                      <span className="text-muted-foreground ml-1">
                        ({movement.sizeName})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Quantity:{" "}
                    <span
                      className={`font-medium ${
                        movement.type === "in"
                          ? "text-green-600"
                          : movement.type === "out"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {movement.type === "in" && "+"}
                      {movement.type === "out" && "-"}
                      {movement.quantity}
                    </span>
                  </span>
                  <span>
                    {new Date(movement.createdAt).toLocaleString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {movement.reason && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Reason: {movement.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
