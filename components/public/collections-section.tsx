import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CollectionCategory } from "@/lib/actions/home";

interface CollectionCardProps {
  category: CollectionCategory;
  size?: "large" | "medium" | "small";
}

function CollectionCard({ category, size = "medium" }: CollectionCardProps) {
  const aspectRatio = size === "large" ? "aspect-[4/5]" : size === "medium" ? "aspect-[3/4]" : "aspect-square";

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative block overflow-hidden"
    >
      <div className={`relative ${aspectRatio} bg-muted`}>
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xl md:text-2xl font-medium">
                {category.name}
              </h3>
              <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <p className="text-white/70 text-sm">
              {category.productCount} {category.productCount === 1 ? "product" : "products"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface CollectionsSectionProps {
  categories: CollectionCategory[];
}

export function CollectionsSection({ categories }: CollectionsSectionProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Browse by Category
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight">
            Collections
          </h2>
          <p className="text-muted-foreground">
            Explore our carefully curated collections designed for every style
          </p>
        </div>

        {/* Collections Grid - Asymmetric Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
          {categories.map((category, index) => {
            // Create an asymmetric layout
            let size: "large" | "medium" | "small" = "medium";
            let className = "";

            if (index === 0) {
              size = "large";
              className = "lg:col-span-7 lg:row-span-2";
            } else if (index === 1) {
              size = "medium";
              className = "lg:col-span-5";
            } else if (index === 2) {
              size = "medium";
              className = "lg:col-span-5";
            } else {
              size = "small";
              className = "lg:col-span-12";
            }

            return (
              <div key={category.id} className={className}>
                <CollectionCard category={category} size={size} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
