import { CollectionsCarousel } from "./collections-carousel";
import type { CategoryWithChildren } from "@/lib/actions/home";

interface CollectionsSectionProps {
  categories: CategoryWithChildren[];
}

export function CollectionsSection({ categories }: CollectionsSectionProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Browse by Category
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
            Find your perfect fit
          </h2>
          <p className="text-muted-foreground text-lg">
            Three distinct worlds, one coherent wardrobe. Browse by category and
            discover pieces that speak to how you actually dress — every day.
          </p>
        </div>

        {/* Collections Carousel */}
        <CollectionsCarousel categories={categories} />
      </div>
    </section>
  );
}
