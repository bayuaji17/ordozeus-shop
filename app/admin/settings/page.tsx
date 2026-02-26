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
import { ArrowRight, MapPin, Ruler, Truck, Banknote } from "lucide-react";

interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  buttonText: string;
}

function SettingCard({
  icon,
  title,
  description,
  href,
  buttonText,
}: SettingCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-1">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Link href={href}>
          <Button variant="outline" className="w-full">
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function SettingsPage() {
  await requireAdmin();

  const settingsCards: SettingCardProps[] = [
    {
      icon: <Ruler className="h-5 w-5 text-primary" />,
      title: "Size Configuration",
      description:
        "Manage size types (Clothing, Shoes) and individual sizes (S, M, L, EU 42)",
      href: "/admin/settings/sizes",
      buttonText: "Configure Sizes",
    },
    {
      icon: <Truck className="h-5 w-5 text-primary" />,
      title: "Courier Configuration",
      description:
        "Manage shipping couriers (JNE, TIKI, POS) available for checkout",
      href: "/admin/settings/couriers",
      buttonText: "Configure Couriers",
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      title: "Location Configuration",
      description: "Set your store location for shipping origin",
      href: "/admin/settings/location",
      buttonText: "Configure Location",
    },
    {
      icon: <Banknote className="h-5 w-5 text-primary" />,
      title: "Shipping Rates",
      description:
        "Configure shipping rates for different destinations and couriers",
      href: "/admin/settings/shipping",
      buttonText: "Configure Rates",
    },
  ];

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
          {settingsCards.map((card) => (
            <SettingCard key={card.href} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
