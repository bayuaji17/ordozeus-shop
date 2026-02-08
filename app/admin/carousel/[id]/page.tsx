import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CarouselForm } from "@/components/admin/carousel/carousel-form";
import { getCarouselById } from "@/lib/actions/carousel";
import { Skeleton } from "@/components/ui/skeleton";

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

export default async function EditCarouselPage({ params }: EditCarouselPageProps) {
  const { id } = await params;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Edit Carousel</h1>
        <p className="text-muted-foreground">
          Update carousel slide details
        </p>
      </div>

      {/* Form */}
      <Suspense fallback={<EditCarouselSkeleton />}>
        <EditCarouselContent id={id} />
      </Suspense>
    </div>
  );
}
