"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ShippingRateList } from "./shipping-rate-list";
import { AddRateDialog } from "./add-rate-dialog";
import {
  type PaginatedRates,
  getShippingRates,
} from "@/lib/actions/shipping-rates";
import { Truck, MapPin } from "lucide-react";

interface Courier {
  id: string;
  name: string;
  code: string;
}

interface Province {
  id: string;
  name: string;
}

interface ShopLocation {
  provinceId?: string | null;
  provinceName?: string | null;
  cityId?: string | null;
  cityName?: string | null;
}

interface ShippingConfigFormProps {
  couriers: Courier[];
  provinces: Province[];
  shopLocation: ShopLocation | null;
  initialRates: PaginatedRates;
}

export function ShippingConfigForm({
  couriers,
  provinces,
  shopLocation,
  initialRates,
}: ShippingConfigFormProps) {
  const [selectedCourier, setSelectedCourier] = useState<string>("all");
  const [rates, setRates] = useState<PaginatedRates>(initialRates);

  const fetchRates = useCallback(
    async (page: number = 1) => {
      try {
        const result = await getShippingRates({
          courierId: selectedCourier === "all" ? undefined : selectedCourier,
          page,
        });
        setRates(result);
      } catch (error) {
        console.error("Error fetching rates:", error);
      }
    },
    [selectedCourier]
  );

  const handleCourierChange = (courierId: string) => {
    setSelectedCourier(courierId);
    // Refetch rates with new courier filter
    getShippingRates({
      courierId: courierId === "all" ? undefined : courierId,
      page: 1,
    }).then(setRates);
  };

  const handlePageChange = (page: number) => {
    fetchRates(page);
  };

  return (
    <div className="space-y-6">
      {/* Origin Location Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Origin Location</CardTitle>
          </div>
          <CardDescription>
            Your store location used as the shipping origin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shopLocation?.cityName ? (
            <div className="flex items-center gap-4">
              <div className="rounded-lg border bg-muted/50 px-4 py-2">
                <div className="text-sm font-medium">
                  {shopLocation.cityName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {shopLocation.provinceName}
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No origin location set. Please configure location in{" "}
              <a href="/admin/settings/location" className="text-primary hover:underline">
                Location Settings
              </a>
              .
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Rates Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <CardTitle>Shipping Rates</CardTitle>
              </div>
              <CardDescription>
                Configure shipping rates for different destinations
              </CardDescription>
            </div>
            <AddRateDialog
              couriers={couriers}
              provinces={provinces}
              onSuccess={() => fetchRates(rates.currentPage)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter */}
          <FieldGroup>
            <Field className="max-w-sm">
              <FieldLabel>Filter by Courier</FieldLabel>
              <FieldContent>
                <Select
                  value={selectedCourier}
                  onValueChange={handleCourierChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All couriers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All couriers</SelectItem>
                    {couriers.map((courier) => (
                      <SelectItem key={courier.id} value={courier.id}>
                        {courier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>

          {/* Rates Table */}
          <ShippingRateList
            rates={rates.rates}
            couriers={couriers}
            provinces={provinces}
            totalCount={rates.totalCount}
            totalPages={rates.totalPages}
            currentPage={rates.currentPage}
            onPageChange={handlePageChange}
            onRefresh={() => fetchRates(rates.currentPage)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
