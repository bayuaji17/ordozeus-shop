"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CarouselFormData } from "@/lib/validations/carousel";

interface CarouselPreviewProps {
  data: Partial<CarouselFormData> & {
    imageUrl?: string;
  };
}

export function CarouselPreview({ data }: CarouselPreviewProps) {
  const hasImage = Boolean(data.imageUrl);

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
        {hasImage ? (
          <>
            {/* Background Image */}
            <div className="relative aspect-[21/9] w-full">
              <Image
                src={data.imageUrl!}
                alt={data.title || "Preview"}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
            </div>
          </>
        ) : (
          /* Placeholder when no image */
          <div className="relative aspect-[21/9] w-full flex items-center justify-center bg-gray-800">
            <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
            <p className="text-white/60 text-lg font-medium z-10">
              Upload an image to see preview
            </p>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex items-center p-6 md:p-10">
          <div className="max-w-2xl space-y-3 md:space-y-4">
            {/* Title */}
            {data.title ? (
              <h1
                className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                style={{ color: data.titleColor || "white" }}
              >
                {data.title}
              </h1>
            ) : (
              <h1
                className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white/40 italic"
              >
                Your title will appear here
              </h1>
            )}

            {/* Subtitle */}
            {data.subtitle && (
              <p
                className="text-lg md:text-xl lg:text-2xl font-medium"
                style={{ color: data.textColor || "white" }}
              >
                {data.subtitle}
              </p>
            )}

            {/* Description */}
            {data.description && (
              <p
                className="text-sm md:text-base lg:text-lg max-w-xl"
                style={{ color: data.textColor || "white" }}
              >
                {data.description}
              </p>
            )}

            {/* CTA Button */}
            {data.ctaText && (
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="text-sm md:text-base px-6 py-4 border-0"
                  style={{
                    backgroundColor: data.buttonBackgroundColor || undefined,
                    color: data.buttonTextColor || undefined,
                  }}
                >
                  <Link href={data.ctaLink || "#"}>{data.ctaText}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Preview updates automatically as you edit the form
      </p>
    </div>
  );
}
