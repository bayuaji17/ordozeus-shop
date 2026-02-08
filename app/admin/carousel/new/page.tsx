import { CarouselForm } from "@/components/admin/carousel/carousel-form";

export default function NewCarouselPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Carousel</h1>
        <p className="text-muted-foreground">
          Add a new carousel slide to your homepage
        </p>
      </div>

      {/* Form */}
      <CarouselForm mode="create" />
    </div>
  );
}
