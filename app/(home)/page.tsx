export const dynamic = "force-dynamic";

import { HeroCarousel } from "@/components/public/hero-carousel";
import { FeaturedProductsCarousel } from "@/components/public/featured-products-carousel";
import { CollectionsSection } from "@/components/public/collections-section";
import { getActiveCarouselItems } from "@/lib/actions/carousel";
import {
  getFeaturedProducts,
  getRootCategoriesWithChildren,
} from "@/lib/actions/home";

export default async function Home() {
  // Fetch data in parallel
  const [carouselSlides, featuredProducts, collectionCategories] =
    await Promise.all([
      getActiveCarouselItems(),
      getFeaturedProducts(6),
      getRootCategoriesWithChildren(8),
    ]);

  return (
    <div>
      {/* Hero Carousel Section */}
      {carouselSlides.length > 0 && <HeroCarousel slides={carouselSlides} />}

      {/* Featured Products Carousel Section */}
      <FeaturedProductsCarousel products={featuredProducts} />

      {/* Collections Section */}
      <CollectionsSection categories={collectionCategories} />
    </div>
  );
}
