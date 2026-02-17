import { HeroCarousel } from "@/components/public/hero-carousel";
import { FeaturedProducts } from "@/components/public/featured-products";
import { CollectionsSection } from "@/components/public/collections-section";
import { getActiveCarouselItems } from "@/lib/actions/carousel";
import { getFeaturedProducts, getRootCategoriesWithChildren } from "@/lib/actions/home";

export default async function Home() {
  // Fetch data in parallel
  const [carouselSlides, featuredProducts, collectionCategories] = await Promise.all([
    getActiveCarouselItems(),
    getFeaturedProducts(8),
    getRootCategoriesWithChildren(8),
  ]);

  return (
    <div>
      {/* Hero Carousel Section */}
      {carouselSlides.length > 0 && (
        <HeroCarousel slides={carouselSlides} />
      )}

      {/* Featured Products Section */}
      <FeaturedProducts products={featuredProducts} />

      {/* Collections Section */}
      <CollectionsSection categories={collectionCategories} />

      {/* Brand Values Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Premium Quality</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Carefully selected materials and expert craftsmanship in every piece
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Free Shipping</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Complimentary shipping on all orders over Rp 500.000
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Easy Returns</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                30-day hassle-free returns for your peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
