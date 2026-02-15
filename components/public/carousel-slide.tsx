"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CarouselSlideProps {
  slide: {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    imageUrl: string;
    ctaText: string | null;
    ctaLink: string | null;
    titleColor: string | null;
    textColor: string | null;
    buttonBackgroundColor: string | null;
    buttonTextColor: string | null;
  };
}

export function CarouselSlide({ slide }: CarouselSlideProps) {
  return (
    <div className="relative h-125 md:h-150 lg:h-175 w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src={slide.imageUrl}
        alt={slide.title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={90}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            {/* Title */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: slide.titleColor || "white" }}
            >
              {slide.title}
            </h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <p
                className="text-xl md:text-2xl lg:text-3xl font-medium"
                style={{ color: slide.textColor || "white" }}
              >
                {slide.subtitle}
              </p>
            )}

            {/* Description */}
            {slide.description && (
              <p
                className="text-base md:text-lg lg:text-xl max-w-xl"
                style={{ color: slide.textColor || "white" }}
              >
                {slide.description}
              </p>
            )}

            {/* CTA Button */}
            {slide.ctaText && slide.ctaLink && (
              <div className="pt-4">
                <Button
                  asChild
                  size="lg"
                  className="text-base md:text-lg px-8 py-6 border-0"
                  style={{
                    backgroundColor: slide.buttonBackgroundColor || undefined,
                    color: slide.buttonTextColor || undefined,
                  }}
                >
                  <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
