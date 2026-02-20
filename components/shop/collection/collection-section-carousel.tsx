"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCardShop } from "@/components/shop/product-card-shop";
import type { CollectionSection } from "@/lib/types/collections";

interface CollectionSectionCarouselProps {
  section: CollectionSection;
}

export function CollectionSectionCarousel({
  section,
}: CollectionSectionCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    handleSelect();

    emblaApi.on("select", handleSelect);
    emblaApi.on("reInit", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("reInit", handleSelect);
    };
  }, [emblaApi]);

  if (section.products.length === 0) return null;

  return (
    <section
      id={`section-${section.slug}`}
      className="container mx-auto px-4 md:px-6 lg:px-8 scroll-mt-32 mt-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-slate-900">
            {section.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {section.productCount} products
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="h-9 w-9 rounded-full border-slate-200 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="h-9 w-9 rounded-full border-slate-200 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Next products"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* View All Link */}
          {section.hasMoreProducts && (
            <Link
              href={`/products?category=${section.slug}`}
              className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors flex items-center gap-1 group"
            >
              View All
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
        <div className="flex gap-4 md:gap-6">
          {section.products.map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_65%] sm:flex-[0_0_45%] md:flex-[0_0_33%] lg:flex-[0_0_25%] xl:flex-[0_0_20%] min-w-0"
            >
              <ProductCardShop product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Scroll Hint */}
      <div className="sm:hidden mt-4 flex justify-center">
        <div className="flex gap-1">
          {section.products
            .slice(0, Math.min(section.products.length, 5))
            .map((_, i) => (
              <div key={i} className="h-1 w-4 rounded-full bg-slate-200" />
            ))}
        </div>
      </div>
    </section>
  );
}
