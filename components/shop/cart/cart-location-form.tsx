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
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

interface LocationOption {
  id: string;
  name: string;
}

interface CartLocationFormProps {
  provinces: LocationOption[];
}

export function CartLocationForm({ provinces }: CartLocationFormProps) {
  const [isPending, startTransition] = useTransition();

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
      if (village) setSelectedVillage(village);
    },
    [villages],
  );

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-slate-500" />
        <h2 className="text-base font-semibold text-slate-900">
          Delivery Location
        </h2>
        {isPending && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 ml-1" />
        )}
      </div>

      <div className="px-6 py-5">
        <FieldGroup>
          {/* Province */}
          <Field>
            <FieldLabel htmlFor="cart-province">Province</FieldLabel>
            <FieldContent>
              <Select
                value={selectedProvince?.id ?? ""}
                onValueChange={handleProvinceChange}
              >
                <SelectTrigger id="cart-province" className="w-full">
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
            <FieldLabel htmlFor="cart-city">City / Regency</FieldLabel>
            <FieldContent>
              <Select
                value={selectedCity?.id ?? ""}
                onValueChange={handleCityChange}
                disabled={!selectedProvince || isPending}
              >
                <SelectTrigger id="cart-city" className="w-full">
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
            <FieldLabel htmlFor="cart-district">District</FieldLabel>
            <FieldContent>
              <Select
                value={selectedDistrict?.id ?? ""}
                onValueChange={handleDistrictChange}
                disabled={!selectedCity || isPending}
              >
                <SelectTrigger id="cart-district" className="w-full">
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
            <FieldLabel htmlFor="cart-village">Village</FieldLabel>
            <FieldContent>
              <Select
                value={selectedVillage?.id ?? ""}
                onValueChange={handleVillageChange}
                disabled={!selectedDistrict || isPending}
              >
                <SelectTrigger id="cart-village" className="w-full">
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
      </div>
    </div>
  );
}
