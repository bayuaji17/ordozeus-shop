import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

interface Variant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  variantValues: Array<{
    optionValue: {
      id: string;
      value: string;
      option: {
        id: string;
        name: string;
      };
    };
  }>;
}

interface ProductVariantsTableProps {
  variants: Variant[];
}

function getStockBadge(stock: number) {
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= 5) {
    return <Badge variant="secondary">Low Stock ({stock})</Badge>;
  }
  return <span className="text-sm">{stock} units</span>;
}

export function ProductVariantsTable({ variants }: ProductVariantsTableProps) {
  if (variants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            No variants found for this product
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group variant values by option name for display
  const getVariantCombination = (variant: Variant) => {
    return variant.variantValues
      .map((vv) => `${vv.optionValue.option.name}: ${vv.optionValue.value}`)
      .join(" • ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variants ({variants.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Combination
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr
                    key={variant.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm">{getVariantCombination(variant)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">{variant.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">
                        {formatCurrency(variant.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStockBadge(variant.stock)}</td>
                    <td className="px-4 py-3">
                      {variant.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {getVariantCombination(variant)}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {variant.sku}
                  </p>
                </div>
                {variant.isActive ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <p className="font-medium">{formatCurrency(variant.price)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Stock:</span>
                  <div className="mt-1">{getStockBadge(variant.stock)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
