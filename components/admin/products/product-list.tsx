import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductListItem } from "@/lib/types";

interface ProductListProps {
  products: ProductListItem[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="default">Active</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "archived":
      return <Badge variant="outline">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getStockBadge(stock: number, hasVariant: boolean) {
  if (hasVariant) {
    return (
      <span className="text-sm text-muted-foreground">
        {stock} total
      </span>
    );
  }

  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= 10) {
    return <Badge variant="secondary">Low Stock ({stock})</Badge>;
  }
  return <span className="text-sm">{stock} units</span>;
}

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Base Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Variants</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Categories</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{formatCurrency(product.basePrice)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {getStockBadge(product.totalStock, product.hasVariant)}
                  </td>
                  <td className="px-4 py-3">
                    {product.hasVariant ? (
                      <span className="text-sm">{product.variantCount} variants</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {product.categoryCount > 0 ? (
                      <span className="text-sm">{product.categoryCount} categories</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(product.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.slug}</p>
              </div>
              {getStatusBadge(product.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
              <div>
                <span className="text-muted-foreground">Price:</span>
                <p className="font-medium">{formatCurrency(product.basePrice)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Stock:</span>
                <div className="mt-1">{getStockBadge(product.totalStock, product.hasVariant)}</div>
              </div>
              {product.hasVariant && (
                <div>
                  <span className="text-muted-foreground">Variants:</span>
                  <p>{product.variantCount}</p>
                </div>
              )}
              {product.categoryCount > 0 && (
                <div>
                  <span className="text-muted-foreground">Categories:</span>
                  <p>{product.categoryCount}</p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
