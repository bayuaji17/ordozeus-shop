import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CarouselForm } from "@/components/admin/carousel/carousel-form";
import { getCarouselById } from "@/lib/actions/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EditCarouselPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditCarouselContent({ id }: { id: string }) {
  const carousel = await getCarouselById(id);

  if (!carousel) {
    notFound();
  }

  return <CarouselForm mode="edit" initialData={carousel} />;
}

function EditCarouselSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  );
}

export default async function EditCarouselPage({
  params,
}: EditCarouselPageProps) {
  const { id } = await params;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <Button asChild>
          <Link href="/admin/carousel">Back</Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Carousel</h1>
          <p className="text-muted-foreground">Update carousel slide details</p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<EditCarouselSkeleton />}>
        <EditCarouselContent id={id} />
      </Suspense>
    </div>
  );
}
