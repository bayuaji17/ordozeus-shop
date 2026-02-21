import { Suspense } from "react";
import Link from "next/link";
import { getCouriers } from "@/lib/actions/couriers";
import { CourierSettingsClient } from "@/components/admin/settings/courier-settings-client";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

async function CouriersContent() {
  const couriers = await getCouriers();

  return <CourierSettingsClient couriers={couriers} />;
}

function CouriersLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default async function CouriersConfigurationPage() {
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
              <BreadcrumbPage>Courier Configuration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Courier Configuration
          </h2>
          <p className="text-muted-foreground">
            Manage shipping couriers for your store
          </p>
        </div>

        <Suspense fallback={<CouriersLoading />}>
          <CouriersContent />
        </Suspense>
      </div>
    </div>
  );
}
