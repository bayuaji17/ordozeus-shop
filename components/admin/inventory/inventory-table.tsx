import { Badge } from "@/components/ui/badge";

interface InventoryItem {
  id: string;
  productId: string;
  productSizeId: string;
  name: string;
  sku: string | null;
  stock: number;
  status: string;
  sizeInfo: string;
  sizeType: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onAdjustStock: (item: InventoryItem) => void;
}

function getStockBadge(stock: number) {
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= 10) {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      >
        Low Stock ({stock})
      </Badge>
    );
  }
  return (
    <Badge
      variant="default"
      className="bg-green-500/10 text-green-700 dark:text-green-400"
    >
      In Stock ({stock})
    </Badge>
  );
}

export function InventoryTable({ items, onAdjustStock }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Product / Size
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm">
                      {item.sku ?? "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="uppercase">
                      {item.sizeInfo}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{getStockBadge(item.stock)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onAdjustStock(item)}
                      className="text-sm text-primary hover:underline"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {item.sku ?? "N/A"}
                </p>
              </div>
              <Badge variant="outline">{item.sizeInfo}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {getStockBadge(item.stock)}
            </div>
            <button
              onClick={() => onAdjustStock(item)}
              className="w-full text-sm text-primary hover:underline text-left"
            >
              Adjust Stock
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
