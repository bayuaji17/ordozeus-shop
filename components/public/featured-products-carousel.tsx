"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCardEditorial } from "./product-card-editorial";
import type { FeaturedProduct } from "@/lib/actions/home";
import { cn } from "@/lib/utils";

interface FeaturedProductsCarouselProps {
  products: FeaturedProduct[];
}

export function FeaturedProductsCarousel({
  products,
}: FeaturedProductsCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
    dragFree: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    // Set initial index
    handleSelect();

    emblaApi.on("select", handleSelect);
    emblaApi.on("reInit", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("reInit", handleSelect);
    };
  }, [emblaApi]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Curated Selection
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight">
              Featured Products
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all group"
          >
            View All Products
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden -mx-3 px-3 py-4" ref={emblaRef}>
            <div className="flex">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_25%] h-full pl-4"
                >
                  <ProductCardEditorial product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation - Right Bottom */}
          <div className="flex items-center justify-end gap-3 mt-8">
            {/* Previous Arrow */}
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="h-10 w-10 rounded-full border-border/50 hover:bg-secondary disabled:opacity-30"
              disabled={selectedIndex === 0}
              aria-label="Previous product"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    selectedIndex === index
                      ? "bg-slate-600 w-6"
                      : "bg-slate-300 w-2 hover:bg-slate-400",
                  )}
                  aria-label={`Go to product ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Arrow */}
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="h-10 w-10 rounded-full border-border/50 hover:bg-secondary disabled:opacity-30"
              disabled={selectedIndex === products.length - 1}
              aria-label="Next product"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
