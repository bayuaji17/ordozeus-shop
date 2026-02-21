import Link from "next/link";
import { requireAdmin } from "@/lib/auth/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler, Truck } from "lucide-react";

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <CardTitle>Size Configuration</CardTitle>
              </div>
              <CardDescription>
                Manage size types (Clothing, Shoes) and individual sizes (S, M, L, EU 42)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings/sizes">
                <Button variant="outline" className="w-full">
                  Configure Sizes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <CardTitle>Courier Configuration</CardTitle>
              </div>
              <CardDescription>
                Manage shipping couriers (JNE, TIKI, POS) available for checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings/couriers">
                <Button variant="outline" className="w-full">
                  Configure Couriers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
