import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Star } from "lucide-react";
import type {
  ProductStatus,
  ProductCategoryRelation,
  ProductSize,
} from "@/lib/types";

interface ProductDetailInfoProps {
  product: {
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    isFeatured: boolean;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    productCategories: ProductCategoryRelation[];
    sizes: ProductSize[];
  };
}

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <div className="flex items-center gap-2">
              <p className="text-base">{product.name}</p>
              {product.isFeatured && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Slug</p>
            <p className="text-base font-mono text-sm">{product.slug}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Description
            </p>
            <p className="text-base">
              {product.description || (
                <span className="text-muted-foreground italic">
                  No description
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Base Price
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(product.basePrice)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Stock
            </p>
            <p className="text-base font-semibold">{totalStock} units</p>
          </div>
          {product.sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                By Size
              </p>
              <div className="space-y-1">
                {product.sizes.map((ps) => (
                  <div
                    key={ps.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{ps.sizeName}</span>
                    <span
                      className={
                        ps.stock === 0
                          ? "text-red-600 font-medium"
                          : ps.stock <= 10
                            ? "text-yellow-600 font-medium"
                            : "text-green-600"
                      }
                    >
                      {ps.stock}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {product.productCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.productCategories.map((pc) => (
                <Badge key={pc.category.id} variant="secondary">
                  {pc.category.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No categories assigned
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created</p>
            <p className="text-base">
              {new Date(product.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Last Updated
            </p>
            <p className="text-base">
              {new Date(product.updatedAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
