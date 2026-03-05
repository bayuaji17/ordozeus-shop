"use client";

import * as React from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  LogOut,
  FolderTree,
  PackageOpen,
  Image,
  ChevronRight,
  Layers,
  ArrowLeftRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

// Flat menu items
const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Carousel",
    url: "/admin/carousel",
    icon: Image,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

// Inventory sub-menu
const inventorySubItems = [
  {
    title: "Stock Levels",
    url: "/admin/inventory",
    icon: Layers,
  },
  {
    title: "Movements",
    url: "/admin/inventory/movements",
    icon: ArrowLeftRight,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const isInventoryActive = pathname.startsWith("/admin/inventory");
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive);

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">OrdoZeus Admin</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Inventory — collapsible with sub-menu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isInventoryActive}
                  onClick={() => setInventoryOpen((o) => !o)}
                >
                  <PackageOpen />
                  <span>Inventory</span>
                  <ChevronRight
                    className={`ml-auto h-4 w-4 transition-transform ${
                      inventoryOpen ? "rotate-90" : ""
                    }`}
                  />
                </SidebarMenuButton>
                {inventoryOpen && (
                  <SidebarMenuSub>
                    {inventorySubItems.map((sub) => {
                      const isSubActive =
                        sub.url === "/admin/inventory"
                          ? pathname === sub.url
                          : pathname.startsWith(sub.url);
                      return (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <a href={sub.url}>
                              <sub.icon className="h-4 w-4" />
                              <span>{sub.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 space-y-2">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium truncate capitalize">
            {session?.user?.name}
          </p>
          <p className="truncate">{session?.user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </SidebarFooter>
    </Sidebar>
  );
}
