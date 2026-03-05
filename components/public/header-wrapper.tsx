"use client";

import dynamic from "next/dynamic";

const Header = dynamic(
  () => import("@/components/public/header").then((mod) => mod.Header),
  {
    ssr: false,
    loading: () => (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-semibold tracking-tight">
                OrdoZeus
              </span>
            </div>
            <div className="w-10 h-10" />
          </div>
        </div>
      </header>
    ),
  },
);

interface NavCategory {
  id: string;
  name: string;
  slug: string;
}

export function HeaderWrapper({ categories }: { categories: NavCategory[] }) {
  return <Header categories={categories} />;
}
