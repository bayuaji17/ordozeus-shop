export function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Cart Items Skeleton */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="h-7 w-40 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded mt-2" />
          </div>
          <div className="px-6 py-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-24 h-24 bg-slate-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 w-24 bg-slate-200 rounded" />
                    <div className="h-6 w-20 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
            </div>
            <div className="h-px bg-slate-200 my-4" />
            <div className="flex justify-between">
              <div className="h-6 w-12 bg-slate-200 rounded" />
              <div className="h-6 w-28 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-12 w-full bg-slate-200 rounded-full mt-6" />
        </div>
      </div>
    </div>
  );
}
