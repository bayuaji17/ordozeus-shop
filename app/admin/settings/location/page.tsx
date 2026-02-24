import { Suspense } from "react";
import Link from "next/link";
import { getShopLocation } from "@/lib/actions/shop-settings";
import { getProvinces, getCitiesByProvince, getDistrictsByCity } from "@/lib/actions/location";
import { LocationForm } from "@/components/admin/settings/location-form";
import { LocationSkeleton } from "@/components/admin/settings/location-skeleton";
import { requireAdmin } from "@/lib/auth/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

async function LocationContent() {
  // Fetch provinces and existing settings in parallel
  const [provinces, settings] = await Promise.all([
    getProvinces(),
    getShopLocation(),
  ]);

  // If we have existing location, preload cities and districts
  let preloadedCities: { id: string; name: string }[] = [];
  let preloadedDistricts: { id: string; name: string }[] = [];

  // Only preload if the stored provinceId exists in the fetched provinces
  // This handles cases where old mock data IDs don't match real wilayah API codes
  const validProvince = settings?.provinceId
    ? provinces.find((p) => p.id === settings.provinceId)
    : null;

  if (validProvince && settings?.provinceId) {
    try {
      const cities = await getCitiesByProvince(settings.provinceId);
      preloadedCities = cities;

      // Only preload districts if the stored cityId exists in the fetched cities
      const validCity = settings.cityId
        ? cities.find((c) => c.id === settings.cityId)
        : null;

      if (validCity && settings.cityId) {
        const districts = await getDistrictsByCity(settings.cityId);
        preloadedDistricts = districts;
      }
    } catch {
      // Ignore preload errors, form will fetch on demand
    }
  }

  return (
    <LocationForm
      provinces={provinces}
      initialData={{
        provinceId: settings?.provinceId || undefined,
        provinceName: settings?.provinceName || undefined,
        cityId: settings?.cityId || undefined,
        cityName: settings?.cityName || undefined,
        districtId: settings?.districtId || undefined,
        districtName: settings?.districtName || undefined,
        postalCode: settings?.postalCode || undefined,
        fullAddress: settings?.fullAddress || undefined,
      }}
      preloadedCities={preloadedCities}
      preloadedDistricts={preloadedDistricts}
    />
  );
}

export default async function LocationConfigurationPage() {
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
              <BreadcrumbPage>Location Configuration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Location Configuration
          </h2>
          <p className="text-muted-foreground">
            Set your store location for shipping and customer information
          </p>
        </div>

        <Suspense fallback={<LocationSkeleton />}>
          <LocationContent />
        </Suspense>
      </div>
    </div>
  );
}
