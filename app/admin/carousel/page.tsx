import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CarouselCard } from "@/components/admin/carousel/carousel-card";
import { getCarouselItems } from "@/lib/actions/carousel";
import { requireAdmin } from "@/lib/auth/server";

interface CarouselPageProps {
  searchParams: Promise<{
    search?: string;
    status?: "all" | "active" | "inactive" | "scheduled";
    page?: string;
  }>;
}

type ResolvedSearchParams = {
  search?: string;
  status?: "all" | "active" | "inactive" | "scheduled";
  page?: string;
};

async function CarouselList({ searchParams }: { searchParams: ResolvedSearchParams }) {
  const { search, status, page } = searchParams;

  const result = await getCarouselItems({
    search,
    status: status || "all",
    page: page ? parseInt(page) : 1,
    limit: 20,
    sortBy: "order",
    sortOrder: "asc",
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Carousels</p>
          <p className="text-2xl font-bold">{result.pagination.total}</p>
        </div>
      </div>

      {/* Carousel Grid */}
      {result.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No carousel items found</p>
          <Button asChild>
            <Link href="/admin/carousel/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Carousel
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.items.map((carousel) => (
            <CarouselCard key={carousel.id} carousel={carousel} />
          ))}
        </div>
      )}
    </div>
  );
}

function CarouselListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function CarouselPage({
  searchParams,
}: CarouselPageProps) {
  await requireAdmin();
  const params = await searchParams;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carousel Management</h1>
          <p className="text-muted-foreground">
            Manage hero carousel slides and promotional banners
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/carousel/new">
            <Plus className="w-4 h-4 mr-2" />
            New Carousel
          </Link>
        </Button>
      </div>

      <Suspense fallback={<CarouselListSkeleton />}>
        <CarouselList searchParams={params} />
      </Suspense>
    </div>
  );
}
