import { HeroCarousel } from "@/components/public/hero-carousel";
import { getActiveCarouselItems } from "@/lib/actions/carousel";

export default async function Home() {
  // Fetch active carousel slides
  const carouselSlides = await getActiveCarouselItems();

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      {carouselSlides.length > 0 && (
        <HeroCarousel slides={carouselSlides} />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <section className="text-center space-y-4">
          <h2 className="text-4xl font-bold">Welcome to OrdoZeus Shop</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your premium e-commerce destination for quality products
          </p>
        </section>

        {/* Placeholder sections - customize as needed */}
        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="p-6 border rounded-lg text-center">
            <h3 className="text-2xl font-semibold mb-2">Featured Products</h3>
            <p className="text-muted-foreground">
              Discover our hand-picked selection
            </p>
          </div>
          <div className="p-6 border rounded-lg text-center">
            <h3 className="text-2xl font-semibold mb-2">New Arrivals</h3>
            <p className="text-muted-foreground">
              Check out the latest additions
            </p>
          </div>
          <div className="p-6 border rounded-lg text-center">
            <h3 className="text-2xl font-semibold mb-2">Best Sellers</h3>
            <p className="text-muted-foreground">
              See what everyone is buying
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
