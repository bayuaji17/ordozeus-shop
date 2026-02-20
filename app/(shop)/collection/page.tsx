import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionData } from "@/lib/actions/collections";
import { CollectionHero } from "@/components/shop/collection/collection-hero";
import { SectionNav } from "@/components/shop/collection/section-nav";
import { CollectionSectionCarousel } from "@/components/shop/collection/collection-section-carousel";
import { CollectionSkeleton } from "@/components/shop/collection/collection-skeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Collection | OrdoZeus",
  description: "Explore our curated collection of premium fashion items.",
};

async function CollectionContent() {
  const data = await getCollectionData();

  if (!data) {
    notFound();
  }

  if (data.sections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-medium text-slate-900 mb-4">
          No collections available
        </h1>
        <p className="text-slate-500">
          Check back soon for our curated collections.
        </p>
      </div>
    );
  }

  return (
    <>
      <CollectionHero description={data.description} />

      <SectionNav sections={data.sections} />

      <div className="space-y-16 md:space-y-24 pb-24">
        {data.sections.map((section) => (
          <CollectionSectionCarousel
            key={section.id}
            section={section}
          />
        ))}
      </div>
    </>
  );
}

export default function CollectionPage() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={<CollectionSkeleton />}>
        <CollectionContent />
      </Suspense>
    </main>
  );
}
