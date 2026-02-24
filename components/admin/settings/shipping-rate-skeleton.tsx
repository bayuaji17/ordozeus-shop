import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ShippingRateSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter bar */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Table */}
        <div className="space-y-2">
          {/* Header */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/6" />
            <Skeleton className="h-8 w-1/6" />
            <Skeleton className="h-8 w-1/6" />
          </div>

          {/* Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-12 w-1/4" />
              <Skeleton className="h-12 w-1/4" />
              <Skeleton className="h-12 w-1/6" />
              <Skeleton className="h-12 w-1/6" />
              <Skeleton className="h-12 w-1/6" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
