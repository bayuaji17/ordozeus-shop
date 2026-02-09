import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import type { ProductStatus, ProductCategoryRelation } from "@/lib/types";

interface ProductDetailInfoProps {
  product: {
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    stock: number | null;
    hasVariant: boolean;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    productCategories: ProductCategoryRelation[];
  };
}

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
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
            <p className="text-base">{product.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Slug</p>
            <p className="text-base font-mono text-sm">{product.slug}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-base">
              {product.description || (
                <span className="text-muted-foreground italic">No description</span>
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
            <p className="text-sm font-medium text-muted-foreground">Base Price</p>
            <p className="text-2xl font-bold">{formatCurrency(product.basePrice)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Product Type</p>
            <Badge variant="outline">
              {product.hasVariant ? "With Variants" : "Simple Product"}
            </Badge>
          </div>
          {!product.hasVariant && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock</p>
              <p className="text-base font-semibold">
                {product.stock ?? 0} units
              </p>
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
                  {pc.category.name} ({pc.category.type})
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
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
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
