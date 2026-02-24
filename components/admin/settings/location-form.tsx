"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FieldDescription,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";
import { saveShopLocation } from "@/lib/actions/shop-settings";
import {
  getCitiesByProvince,
  getDistrictsByCity,
} from "@/lib/actions/location";
import { toast } from "sonner";
import { MapPin, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface LocationOption {
  id: string;
  name: string;
}

interface LocationFormProps {
  provinces: LocationOption[];
  initialData?: {
    provinceId?: string;
    provinceName?: string;
    cityId?: string;
    cityName?: string;
    districtId?: string;
    districtName?: string;
    postalCode?: string;
    fullAddress?: string;
  };
  preloadedCities?: LocationOption[];
  preloadedDistricts?: LocationOption[];
}

export function LocationForm({
  provinces,
  initialData,
  preloadedCities = [],
  preloadedDistricts = [],
}: LocationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const [selectedProvince, setSelectedProvince] =
    useState<LocationOption | null>(
      initialData?.provinceId
        ? { id: initialData.provinceId, name: initialData.provinceName || "" }
        : null,
    );
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(
    initialData?.cityId
      ? { id: initialData.cityId, name: initialData.cityName || "" }
      : null,
  );
  const [selectedDistrict, setSelectedDistrict] =
    useState<LocationOption | null>(
      initialData?.districtId
        ? { id: initialData.districtId, name: initialData.districtName || "" }
        : null,
    );

  const [cities, setCities] = useState<LocationOption[]>(preloadedCities);
  const [districts, setDistricts] =
    useState<LocationOption[]>(preloadedDistricts);

  const [postalCode, setPostalCode] = useState(initialData?.postalCode || "");
  const [fullAddress, setFullAddress] = useState(
    initialData?.fullAddress || "",
  );

  const handleProvinceChange = useCallback(
    (provinceId: string) => {
      const province = provinces.find((p) => p.id === provinceId);
      if (!province) return;

      setSelectedProvince(province);
      setSelectedCity(null);
      setSelectedDistrict(null);
      setCities([]);
      setDistricts([]);

      startTransition(async () => {
        try {
          const data = await getCitiesByProvince(provinceId);
          setCities(data);
        } catch {
          toast.error("Failed to load cities");
        }
      });
    },
    [provinces],
  );

  const handleCityChange = useCallback(
    (cityId: string) => {
      const city = cities.find((c) => c.id === cityId);
      if (!city) return;

      setSelectedCity(city);
      setSelectedDistrict(null);
      setDistricts([]);

      startTransition(async () => {
        try {
          const data = await getDistrictsByCity(cityId);
          setDistricts(data);
        } catch {
          toast.error("Failed to load districts");
        }
      });
    },
    [cities],
  );

  const handleDistrictChange = useCallback(
    (districtId: string) => {
      const district = districts.find((d) => d.id === districtId);
      if (district) {
        setSelectedDistrict(district);
      }
    },
    [districts],
  );

  const handleSave = async () => {
    if (!selectedProvince || !selectedCity || !selectedDistrict) return;

    setIsSaving(true);
    try {
      const result = await saveShopLocation({
        provinceId: selectedProvince.id,
        provinceName: selectedProvince.name,
        cityId: selectedCity.id,
        cityName: selectedCity.name,
        districtId: selectedDistrict.id,
        districtName: selectedDistrict.name,
        postalCode: postalCode || undefined,
        fullAddress: fullAddress || undefined,
      });

      if (result.success) {
        toast.success("Location saved successfully");
      } else {
        toast.error(result.error || "Failed to save location");
      }
    } catch {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const isComplete = selectedProvince && selectedCity && selectedDistrict;
  const progress = [selectedProvince, selectedCity, selectedDistrict].filter(
    Boolean,
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>Shop Location</CardTitle>
        </div>
        <CardDescription>
          Set your store location for shipping calculations and customer
          information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              progress >= 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {progress >= 1 ? <Check className="h-3 w-3" /> : "1"}
          </div>
          <div
            className={`h-0.5 w-8 ${progress >= 2 ? "bg-primary" : "bg-muted"}`}
          />
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              progress >= 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {progress >= 2 ? <Check className="h-3 w-3" /> : "2"}
          </div>
          <div
            className={`h-0.5 w-8 ${progress >= 3 ? "bg-primary" : "bg-muted"}`}
          />
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              progress >= 3
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {progress >= 3 ? <Check className="h-3 w-3" /> : "3"}
          </div>
          <span className="ml-2 text-muted-foreground">
            {progress === 0 && "Select province"}
            {progress === 1 && "Select city"}
            {progress === 2 && "Select district"}
            {progress === 3 && "Location complete"}
          </span>
        </div>

        {/* Location Selectors */}
        <FieldGroup>
          {/* Province - fetched on page load */}
          <Field>
            <FieldLabel>Province</FieldLabel>
            <FieldDescription>
              Select your store&apos;s province
            </FieldDescription>
            <FieldContent>
              <Select
                value={selectedProvince?.id}
                onValueChange={handleProvinceChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select province..." />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          {/* City - fetched on province select */}
          <Field>
            <FieldLabel>City / Regency</FieldLabel>
            <FieldDescription>
              Select city or regency within the province
            </FieldDescription>
            <FieldContent className="w-full">
              <Select
                value={selectedCity?.id}
                onValueChange={handleCityChange}
                disabled={!selectedProvince || isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isPending ? "Loading cities..." : "Select city..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          {/* District - fetched on city select */}
          <Field>
            <FieldLabel>District</FieldLabel>
            <FieldDescription>
              Select district (kecamatan) within the city
            </FieldDescription>
            <FieldContent className="w-full">
              <Select
                value={selectedDistrict?.id}
                onValueChange={handleDistrictChange}
                disabled={!selectedCity || isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isPending ? "Loading districts..." : "Select district..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          {/* Postal Code */}
          <Field>
            <FieldLabel>Postal Code</FieldLabel>
            <FieldContent className="w-full">
              <Input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g., 40135"
              />
            </FieldContent>
          </Field>

          {/* Full Address */}
          <Field>
            <FieldLabel>Full Address</FieldLabel>
            <FieldDescription>
              Enter your complete store address
            </FieldDescription>
            <FieldContent>
              <Textarea
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Enter your complete store address..."
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button
          onClick={handleSave}
          disabled={!isComplete || isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Location"}
        </Button>
      </CardContent>
    </Card>
  );
}
