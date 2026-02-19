export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-200 rounded-2xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-slate-200 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-6 w-1/4 bg-slate-200 rounded" />
          </div>

          <div className="h-px bg-slate-200" />

          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-2/3 bg-slate-200 rounded" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-slate-200 rounded-full" />
            <div className="flex-1 h-12 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
