import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { getRootCategoriesWithChildren } from "@/lib/actions/home";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getRootCategoriesWithChildren();

  // Map to simple nav format (id, name, slug)
  const navCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  return (
    <>
      <Header categories={navCategories} />
      {children}
      <Footer />
    </>
  );
}
