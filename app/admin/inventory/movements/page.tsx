import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/server";
import { getInventoryHistory } from "@/lib/actions/inventory";
import { MovementsClient } from "@/components/admin/inventory/movements-client";
import { Skeleton } from "@/components/ui/skeleton";

interface MovementsPageProps {
  searchParams: Promise<{
    type?: "in" | "out" | "adjust";
    search?: string;
    page?: string;
  }>;
}

async function MovementsContent({ searchParams }: MovementsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const { movements, pagination } = await getInventoryHistory({
    type: params.type,
    search: params.search,
    page,
    limit: 20,
  });

  return <MovementsClient movements={movements} pagination={pagination} />;
}

function MovementsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default async function InventoryMovementsPage({
  searchParams,
}: MovementsPageProps) {
  await requireAdmin();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Inventory Movements
        </h2>
        <p className="text-muted-foreground">
          Full history of all stock movements — in, out, and adjustments
        </p>
      </div>

      <Suspense fallback={<MovementsLoading />}>
        <MovementsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
