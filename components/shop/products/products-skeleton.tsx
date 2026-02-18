import { Skeleton } from "@/components/ui/skeleton";

// Rendering-hoist-jsx: Extract static JSX, avoid recreating on each render
const SidebarItemSkeleton = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="h-4 w-4" />
    <Skeleton className="h-4 w-24" />
  </div>
);

const ProductCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-[4/5] w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-10 w-full" />
  </div>
);

export function ProductsSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block w-64 shrink-0 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" /> {/* Apply button */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SidebarItemSkeleton key={i} />
            ))}
          </div>
        </div>

        <Skeleton className="h-px w-full" />

        <div className="space-y-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20 hidden sm:block" />
            </div>
          </div>
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
