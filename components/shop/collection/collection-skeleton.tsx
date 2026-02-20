import { Skeleton } from "@/components/ui/skeleton";

export function CollectionSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-white" />
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
          <div className="py-16 md:py-24 lg:py-32 text-center">
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 md:h-16 lg:h-20 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </div>
      </section>

      {/* Nav Skeleton */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Sections Skeleton */}
      <div className="space-y-16 md:space-y-24 pb-24 py-12">
        {[1, 2, 3].map((sectionIdx) => (
          <div
            key={sectionIdx}
            className="container mx-auto px-4 md:px-6 lg:px-8"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
