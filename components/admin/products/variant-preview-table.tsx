"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { FieldError } from "@/components/ui/field";
import type { VariantPreviewData } from "@/lib/types";

interface VariantPreviewTableProps {
  variants: VariantPreviewData[];
  basePrice: number;
  onVariantChange: (index: number, field: keyof VariantPreviewData, value: string | number) => void;
  errors?: Record<number, Record<string, { message?: string }>>;
}

export function VariantPreviewTable({
  variants,
  basePrice,
  onVariantChange,
  errors,
}: VariantPreviewTableProps) {
  if (variants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variant Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Add options above to generate variants automatically
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Generated Variants ({variants.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Review and adjust SKU, price, and stock for each variant
        </p>
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
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {variant.combination}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <Input
                          value={variant.sku}
                          onChange={(e) =>
                            onVariantChange(index, "sku", e.target.value)
                          }
                          className={`font-mono text-sm ${errors?.[index]?.sku ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          placeholder="SKU"
                        />
                        {errors?.[index]?.sku && (
                          <FieldError errors={[errors[index].sku]} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            onVariantChange(index, "price", parseInt(e.target.value) || 0)
                          }
                          className={`w-32 ${errors?.[index]?.price ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                      </div>
                      {errors?.[index]?.price && (
                        <FieldError errors={[errors[index].price]} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          onVariantChange(index, "stock", parseInt(e.target.value) || 0)
                        }
                        className={`w-24 ${errors?.[index]?.stock ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        min="0"
                      />
                      {errors?.[index]?.stock && (
                        <FieldError errors={[errors[index].stock]} />
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
          {variants.map((variant, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div>
                <Badge variant="outline">{variant.combination}</Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <Label htmlFor={`sku-${index}`} className="text-xs">
                    SKU
                  </Label>
                  <Input
                    id={`sku-${index}`}
                    value={variant.sku}
                    onChange={(e) =>
                      onVariantChange(index, "sku", e.target.value)
                    }
                    className={`font-mono text-sm mt-1 ${errors?.[index]?.sku ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors?.[index]?.sku && (
                    <FieldError errors={[errors[index].sku]} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`price-${index}`} className="text-xs">
                      Price (IDR)
                    </Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        onVariantChange(index, "price", parseInt(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`stock-${index}`} className="text-xs">
                      Stock
                    </Label>
                    <Input
                      id={`stock-${index}`}
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        onVariantChange(index, "stock", parseInt(e.target.value) || 0)
                      }
                      min="0"
                      className={`mt-1 ${errors?.[index]?.stock ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors?.[index]?.stock && (
                      <FieldError errors={[errors[index].stock]} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>{variants.length} variants</strong> will be created. Default
            price set to{" "}
            <strong>{formatCurrency(basePrice)}</strong>. You can adjust
            individual prices above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Re-export the type for backwards compatibility
export type { VariantPreviewData };
