import { Suspense } from "react";
import Link from "next/link";
import { getSizes } from "@/lib/actions/sizes";
import { getSizeTypes } from "@/lib/actions/size-types";
import { SizeSettingsClient } from "@/components/admin/settings/size-settings-client";
import { SizeTypeSettingsClient } from "@/components/admin/settings/size-type-settings-client";
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

async function SizesContent() {
  const [{ all, grouped }, sizeTypes] = await Promise.all([
    getSizes(),
    getSizeTypes(),
  ]);

  const sizeTypeOptions = sizeTypes.map((t) => ({ id: t.id, name: t.name }));

  return (
    <div className="space-y-6">
      <SizeTypeSettingsClient sizeTypes={sizeTypes} />
      <SizeSettingsClient
        sizes={all}
        grouped={grouped}
        sizeTypes={sizeTypeOptions}
      />
    </div>
  );
}

function SizesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-60 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default async function SizesConfigurationPage() {
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
              <BreadcrumbPage>Size Configuration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Size Configuration
          </h2>
          <p className="text-muted-foreground">
            Manage size types and sizes for your products
          </p>
        </div>

        <Suspense fallback={<SizesLoading />}>
          <SizesContent />
        </Suspense>
      </div>
    </div>
  );
}
