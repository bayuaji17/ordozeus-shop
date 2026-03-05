"use client";

import Link from "next/link";
import { ShoppingBag, Menu, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartHydration } from "@/components/shop/cart/cart-hydration-wrapper";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
}

interface HeaderProps {
  categories?: NavCategory[];
}

/**
 * Cart button with SSR-safe rendering.
 *
 * During SSR and initial hydration:
 * - Badge is invisible (opacity-0)
 * - No text content rendered (prevents hydration mismatch)
 *
 * After hydration completes:
 * - Badge fades in with actual count
 */
function CartButton() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const isHydrated = useCartHydration();

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingBag className="h-5 w-5" />
        <span className="sr-only">Cart</span>
        {/* SSR-safe badge: invisible until hydrated */}
        <span
          className={cn(
            "absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center transition-opacity duration-200",
            isHydrated ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!isHydrated}
        >
          {isHydrated ? (itemCount > 99 ? "99+" : itemCount) : ""}
        </span>
      </Button>
    </Link>
  );
}

export function Header({ categories = [] }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-75">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" className="text-xl font-semibold">
                      OrdoZeus
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8 px-4">
                  <nav className="flex flex-col gap-4">
                    <SheetClose asChild>
                      <Link
                        href="/products"
                        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Shop
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/track-order"
                        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <PackageSearch className="h-5 w-5" />
                        Track Order
                      </Link>
                    </SheetClose>

                    {/* Categories section in mobile */}
                    {categories.length > 0 && (
                      <>
                        <span className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold mt-2">
                          Categories
                        </span>
                        {categories.map((cat) => (
                          <SheetClose asChild key={cat.id}>
                            <Link
                              href={`/categories/${cat.slug}`}
                              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors pl-2"
                            >
                              {cat.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold tracking-tight">
              OrdoZeus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {/* Shop Link */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle() + " bg-transparent"}
                >
                  <Link href="/products">Shop</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Categories Dropdown */}
              {categories.length > 0 && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Categories
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-1 p-2">
                      {categories.map((cat) => (
                        <li key={cat.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/categories/${cat.slug}`}
                              className="block select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              {cat.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/track-order" className="hidden lg:flex">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <PackageSearch className="h-4 w-4" />
                <span className="text-sm">Track Order</span>
              </Button>
            </Link>
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
