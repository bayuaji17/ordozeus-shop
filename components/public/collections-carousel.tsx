"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryWithChildren } from "@/lib/actions/home";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: CategoryWithChildren;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="group relative flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] h-full pl-4">
      <Link
        href={`/categories/${category.slug}`}
        className="block relative overflow-hidden rounded-2xl bg-muted h-full"
      >
        <div className="relative aspect-4/5 h-full">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-secondary to-muted" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
                {category.name}
              </h3>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-white/20">
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

interface CollectionsCarouselProps {
  categories: CategoryWithChildren[];
}

export function CollectionsCarousel({ categories }: CollectionsCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: false,
    },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

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

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Carousel Container with overflow visible for peek effect */}
      <div className="overflow-hidden -mx-3 px-3" ref={emblaRef}>
        <div className="flex">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Navigation Container - Bottom Center */}
      <div className="flex items-center justify-center gap-4 mt-8">
        {/* Previous Arrow */}
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          className="h-10 w-10 rounded-full border-border/50 hover:bg-secondary"
          aria-label="Previous category"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Dots */}
        <div className="flex gap-2">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "bg-primary w-6"
                  : "bg-primary/30 w-2 hover:bg-primary/50",
              )}
              aria-label={`Go to category ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Arrow */}
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          className="h-10 w-10 rounded-full border-border/50 hover:bg-secondary"
          aria-label="Next category"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
