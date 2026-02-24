import { Suspense } from "react";
import Link from "next/link";
import { getCouriers } from "@/lib/actions/couriers";
import { getProvinces } from "@/lib/actions/location";
import { getShopLocation } from "@/lib/actions/shop-settings";
import { getShippingRates } from "@/lib/actions/shipping-rates";
import { ShippingConfigForm } from "@/components/admin/settings/shipping-config-form";
import { ShippingRateSkeleton } from "@/components/admin/settings/shipping-rate-skeleton";
import { requireAdmin } from "@/lib/auth/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Parallel data fetching - Vercel best practice
async function ShippingContent() {
  // Fetch all initial data in parallel
  const [couriers, provinces, shopLocation, initialRates] = await Promise.all([
    getCouriers(),
    getProvinces(),
    getShopLocation(),
    getShippingRates({ page: 1 }),
  ]);

  return (
    <ShippingConfigForm
      couriers={couriers}
      provinces={provinces}
      shopLocation={shopLocation}
      initialRates={initialRates}
    />
  );
}

export default async function ShippingConfigurationPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/settings">Settings</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shipping Configuration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Shipping Configuration
          </h2>
          <p className="text-muted-foreground">
            Manage shipping rates and couriers for your store
          </p>
        </div>

        <Suspense fallback={<ShippingRateSkeleton />}>
          <ShippingContent />
        </Suspense>
      </div>
    </div>
  );
}
