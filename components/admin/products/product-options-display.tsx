import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductOption } from "@/lib/types";

interface ProductOptionsDisplayProps {
  options: ProductOption[];
}

export function ProductOptionsDisplay({ options }: ProductOptionsDisplayProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {options.map((option) => (
          <div key={option.id}>
            <p className="text-sm font-medium mb-2">{option.name}</p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => (
                <Badge key={value.id} variant="outline">
                  {value.value}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
