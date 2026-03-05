import { HeaderWrapper } from "@/components/public/header-wrapper";
import { Footer } from "@/components/public/footer";
import { getRootCategoriesWithChildren } from "@/lib/actions/home";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getRootCategoriesWithChildren();

  const navCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  return (
    <>
      <HeaderWrapper categories={navCategories} />
      {children}
      <Footer />
    </>
  );
}
