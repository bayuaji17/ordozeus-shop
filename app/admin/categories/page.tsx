import { Suspense } from "react";
import { getCategories } from "@/lib/actions/categories";
import { CategoriesClient } from "@/components/admin/categories/categories-client";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriesPageProps {
  searchParams: Promise<{
    search?: string;
    level?: string;
    status?: string;
    page?: string;
  }>;
}

async function CategoriesContent({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const { categories, pagination } = await getCategories({
    search: params.search,
    level: params.level ? parseInt(params.level) : undefined,
    isActive:
      params.status === "true"
        ? true
        : params.status === "false"
          ? false
          : "all",
    page,
    limit: 10,
  });

  return <CategoriesClient categories={categories} pagination={pagination} />;
}

function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-100 w-full" />
    </div>
  );
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  return (
    <div className="p-6">
      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
