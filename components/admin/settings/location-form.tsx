"use client";

import { useState, useTransition, useCallback, Fragment } from "react";
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
  getVillagesByDistrict,
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
    villageId?: string;
    villageName?: string;
    postalCode?: string;
    fullAddress?: string;
  };
  preloadedCities?: LocationOption[];
  preloadedDistricts?: LocationOption[];
  preloadedVillages?: LocationOption[];
}

export function LocationForm({
  provinces,
  initialData,
  preloadedCities = [],
  preloadedDistricts = [],
  preloadedVillages = [],
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
  const [selectedVillage, setSelectedVillage] = useState<LocationOption | null>(
    initialData?.villageId
      ? { id: initialData.villageId, name: initialData.villageName || "" }
      : null,
  );

  const [cities, setCities] = useState<LocationOption[]>(preloadedCities);
  const [districts, setDistricts] =
    useState<LocationOption[]>(preloadedDistricts);
  const [villages, setVillages] = useState<LocationOption[]>(preloadedVillages);

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
      setSelectedVillage(null);
      setCities([]);
      setDistricts([]);
      setVillages([]);

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
      setSelectedVillage(null);
      setDistricts([]);
      setVillages([]);

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
      if (!district) return;

      setSelectedDistrict(district);
      setSelectedVillage(null);
      setVillages([]);

      startTransition(async () => {
        try {
          const data = await getVillagesByDistrict(districtId);
          setVillages(data);
        } catch {
          toast.error("Failed to load villages");
        }
      });
    },
    [districts],
  );

  const handleVillageChange = useCallback(
    (villageId: string) => {
      const village = villages.find((v) => v.id === villageId);
      if (village) {
        setSelectedVillage(village);
      }
    },
    [villages],
  );

  const handleSave = async () => {
    if (
      !selectedProvince ||
      !selectedCity ||
      !selectedDistrict ||
      !selectedVillage
    )
      return;

    setIsSaving(true);
    try {
      const result = await saveShopLocation({
        provinceId: selectedProvince.id,
        provinceName: selectedProvince.name,
        cityId: selectedCity.id,
        cityName: selectedCity.name,
        districtId: selectedDistrict.id,
        districtName: selectedDistrict.name,
        villageId: selectedVillage.id,
        villageName: selectedVillage.name,
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

  const isComplete =
    selectedProvince && selectedCity && selectedDistrict && selectedVillage;
  const progress = [
    selectedProvince,
    selectedCity,
    selectedDistrict,
    selectedVillage,
  ].filter(Boolean).length;

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
          {[1, 2, 3, 4].map((step, index) => (
            <Fragment key={step}>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  progress >= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {progress >= step ? <Check className="h-3 w-3" /> : step}
              </div>
              {index < 3 && (
                <div
                  className={`h-0.5 w-8 ${progress >= step + 1 ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </Fragment>
          ))}
          <span className="ml-2 text-muted-foreground">
            {progress === 0 && "Select province"}
            {progress === 1 && "Select city"}
            {progress === 2 && "Select district"}
            {progress === 3 && "Select village"}
            {progress === 4 && "Location complete"}
          </span>
        </div>

        {/* Location Selectors */}
        <FieldGroup>
          {/* Province */}
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

          {/* City */}
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

          {/* District */}
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

          {/* Village */}
          <Field>
            <FieldLabel>Village</FieldLabel>
            <FieldDescription>
              Select village (kelurahan/desa) within the district
            </FieldDescription>
            <FieldContent className="w-full">
              <Select
                value={selectedVillage?.id}
                onValueChange={handleVillageChange}
                disabled={!selectedDistrict || isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isPending ? "Loading villages..." : "Select village..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {villages.map((village) => (
                    <SelectItem key={village.id} value={village.id}>
                      {village.name}
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
