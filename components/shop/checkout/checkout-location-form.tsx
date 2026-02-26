"use client";

import { useState, useTransition, useCallback } from "react";
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
import {
  getCitiesByProvince,
  getDistrictsByCity,
  getVillagesByDistrict,
} from "@/lib/actions/location";
import { getLowestShippingRateForCity } from "@/lib/actions/shipping-rates";
import { useCheckoutStore } from "@/lib/stores/checkout-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LocationOption {
  id: string;
  name: string;
}

export interface CheckoutLocationValue {
  provinceId: string;
  provinceName: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  villageId: string;
  villageName: string;
}

interface CheckoutLocationFormProps {
  provinces: LocationOption[];
  value?: CheckoutLocationValue | null;
  onChange: (value: CheckoutLocationValue | null) => void;
  disabled?: boolean;
}

export function CheckoutLocationForm({
  provinces,
  onChange,
  disabled = false,
}: CheckoutLocationFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setShipping } = useCheckoutStore();

  const [selectedProvince, setSelectedProvince] =
    useState<LocationOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<LocationOption | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<LocationOption | null>(
    null,
  );

  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [villages, setVillages] = useState<LocationOption[]>([]);

  // Notify parent + trigger shipping calculation when complete
  const notifyChange = useCallback(
    (
      province: LocationOption | null,
      city: LocationOption | null,
      district: LocationOption | null,
      village: LocationOption | null,
    ) => {
      if (province && city && district && village) {
        onChange({
          provinceId: province.id,
          provinceName: province.name,
          cityId: city.id,
          cityName: city.name,
          districtId: district.id,
          districtName: district.name,
          villageId: village.id,
          villageName: village.name,
        });

        // Auto-calculate shipping from city
        startTransition(async () => {
          try {
            const rate = await getLowestShippingRateForCity(city.id);
            setShipping(rate?.basePrice ?? null);
          } catch {
            setShipping(null);
          }
        });
      } else {
        onChange(null);
        setShipping(null);
      }
    },
    [onChange, setShipping],
  );

  const handleProvinceChange = useCallback(
    (provinceId: string) => {
      const province = provinces.find((p) => p.id === provinceId) ?? null;
      setSelectedProvince(province);
      setSelectedCity(null);
      setSelectedDistrict(null);
      setSelectedVillage(null);
      setCities([]);
      setDistricts([]);
      setVillages([]);
      notifyChange(province, null, null, null);

      if (!province) return;
      startTransition(async () => {
        try {
          setCities(await getCitiesByProvince(provinceId));
        } catch {
          toast.error("Failed to load cities");
        }
      });
    },
    [provinces, notifyChange],
  );

  const handleCityChange = useCallback(
    (cityId: string) => {
      const city = cities.find((c) => c.id === cityId) ?? null;
      setSelectedCity(city);
      setSelectedDistrict(null);
      setSelectedVillage(null);
      setDistricts([]);
      setVillages([]);
      notifyChange(selectedProvince, city, null, null);

      if (!city) return;
      startTransition(async () => {
        try {
          setDistricts(await getDistrictsByCity(cityId));
        } catch {
          toast.error("Failed to load districts");
        }
      });
    },
    [cities, selectedProvince, notifyChange],
  );

  const handleDistrictChange = useCallback(
    (districtId: string) => {
      const district = districts.find((d) => d.id === districtId) ?? null;
      setSelectedDistrict(district);
      setSelectedVillage(null);
      setVillages([]);
      notifyChange(selectedProvince, selectedCity, district, null);

      if (!district) return;
      startTransition(async () => {
        try {
          setVillages(await getVillagesByDistrict(districtId));
        } catch {
          toast.error("Failed to load villages");
        }
      });
    },
    [districts, selectedProvince, selectedCity, notifyChange],
  );

  const handleVillageChange = useCallback(
    (villageId: string) => {
      const village = villages.find((v) => v.id === villageId) ?? null;
      setSelectedVillage(village);
      notifyChange(selectedProvince, selectedCity, selectedDistrict, village);
    },
    [villages, selectedProvince, selectedCity, selectedDistrict, notifyChange],
  );

  return (
    <FieldGroup>
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground -mb-4">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading...
        </div>
      )}

      {/* Province */}
      <Field>
        <FieldLabel htmlFor="checkout-province">Province *</FieldLabel>
        <FieldContent>
          <Select
            value={selectedProvince?.id ?? ""}
            onValueChange={handleProvinceChange}
            disabled={disabled}
          >
            <SelectTrigger id="checkout-province" className="w-full">
              <SelectValue placeholder="Select province..." />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>

      {/* City */}
      <Field>
        <FieldLabel htmlFor="checkout-city">City / Regency *</FieldLabel>
        <FieldContent>
          <Select
            value={selectedCity?.id ?? ""}
            onValueChange={handleCityChange}
            disabled={disabled || !selectedProvince || isPending}
          >
            <SelectTrigger id="checkout-city" className="w-full">
              <SelectValue
                placeholder={
                  isPending && selectedProvince
                    ? "Loading cities..."
                    : "Select city..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>

      {/* District */}
      <Field>
        <FieldLabel htmlFor="checkout-district">District *</FieldLabel>
        <FieldContent>
          <Select
            value={selectedDistrict?.id ?? ""}
            onValueChange={handleDistrictChange}
            disabled={disabled || !selectedCity || isPending}
          >
            <SelectTrigger id="checkout-district" className="w-full">
              <SelectValue
                placeholder={
                  isPending && selectedCity
                    ? "Loading districts..."
                    : "Select district..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>

      {/* Village */}
      <Field>
        <FieldLabel htmlFor="checkout-village">Village *</FieldLabel>
        <FieldContent>
          <Select
            value={selectedVillage?.id ?? ""}
            onValueChange={handleVillageChange}
            disabled={disabled || !selectedDistrict || isPending}
          >
            <SelectTrigger id="checkout-village" className="w-full">
              <SelectValue
                placeholder={
                  isPending && selectedDistrict
                    ? "Loading villages..."
                    : "Select village..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {villages.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
