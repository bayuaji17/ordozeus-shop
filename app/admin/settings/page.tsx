import { Suspense } from "react";
import { getSizes } from "@/lib/actions/sizes";
import { getSizeTypes } from "@/lib/actions/size-types";
import { SizeSettingsClient } from "@/components/admin/settings/size-settings-client";
import { SizeTypeSettingsClient } from "@/components/admin/settings/size-type-settings-client";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/server";

async function SettingsContent() {
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

function SettingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-60 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage store configuration and product options
          </p>
        </div>

        <Suspense fallback={<SettingsLoading />}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
}
