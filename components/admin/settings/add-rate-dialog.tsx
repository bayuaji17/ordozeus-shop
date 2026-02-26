"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";
import {
  createShippingRate,
  updateShippingRate,
  type ShippingRate,
} from "@/lib/actions/shipping-rates";
import { getCitiesByProvince } from "@/lib/actions/location";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Courier {
  id: string;
  name: string;
  code: string;
}

interface Province {
  id: string;
  name: string;
}

interface AddRateDialogProps {
  couriers: Courier[];
  provinces: Province[];
  existingRate?: ShippingRate;
  onSuccess?: () => void;
}

interface RateFormData {
  courierId: string;
  destinationProvinceId: string;
  destinationCityId: string;
  basePrice: number;
  estimatedDays?: string;
  isActive: boolean;
}

export function AddRateDialog({
  couriers,
  provinces,
  existingRate,
  onSuccess,
}: AddRateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const isEditing = !!existingRate;

  const { control, handleSubmit, watch, setValue, reset } =
    useForm<RateFormData>({
      defaultValues: existingRate
        ? {
            courierId: existingRate.courierId,
            destinationProvinceId: existingRate.destinationProvinceId,
            destinationCityId: existingRate.destinationCityId,
            basePrice: existingRate.basePrice,
            estimatedDays: existingRate.estimatedDays || "",
            isActive: existingRate.isActive,
          }
        : {
            courierId: "",
            destinationProvinceId: "",
            destinationCityId: "",
            basePrice: 0,
            estimatedDays: "",
            isActive: true,
          },
    });

  const selectedProvince = watch("destinationProvinceId");

  const handleProvinceChange = (provinceId: string) => {
    setValue("destinationProvinceId", provinceId);
    setValue("destinationCityId", "");
    setCities([]);

    if (provinceId) {
      setIsLoadingCities(true);
      startTransition(async () => {
        try {
          const citiesData = await getCitiesByProvince(provinceId);
          setCities(citiesData);
        } catch {
          toast.error("Failed to load cities");
        } finally {
          setIsLoadingCities(false);
        }
      });
    }
  };

  const onSubmit = async (data: RateFormData) => {
    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateShippingRate(existingRate.id, {
              courierId: data.courierId,
              destinationCityId: data.destinationCityId,
              destinationProvinceId: data.destinationProvinceId,
              basePrice: data.basePrice,
              estimatedDays: data.estimatedDays,
              isActive: data.isActive,
            })
          : await createShippingRate({
              courierId: data.courierId,
              destinationCityId: data.destinationCityId,
              destinationProvinceId: data.destinationProvinceId,
              basePrice: data.basePrice,
              estimatedDays: data.estimatedDays,
              isActive: data.isActive,
            });

        if (result.success) {
          toast.success(
            isEditing
              ? "Shipping rate updated successfully"
              : "Shipping rate created successfully",
          );
          setOpen(false);
          reset();
          setCities([]);
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to save shipping rate");
        }
      } catch {
        toast.error("An error occurred while saving");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Rate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] lg:max-w-[800px]">
        <ScrollArea className="h-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Shipping Rate" : "Add Shipping Rate"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the shipping rate details below."
                : "Configure a new shipping rate for a destination."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="py-4">
              {/* Courier */}
              <Field>
                <FieldLabel>Courier</FieldLabel>
                <FieldDescription>Select the shipping courier</FieldDescription>
                <FieldContent>
                  <Controller
                    name="courierId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select courier..." />
                        </SelectTrigger>
                        <SelectContent>
                          {couriers.map((courier) => (
                            <SelectItem key={courier.id} value={courier.id}>
                              {courier.name} ({courier.code.toUpperCase()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldContent>
              </Field>

              {/* Province */}
              <Field>
                <FieldLabel>Destination Province</FieldLabel>
                <FieldDescription>
                  Select the destination province
                </FieldDescription>
                <FieldContent>
                  <Controller
                    name="destinationProvinceId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={handleProvinceChange}
                        disabled={isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province..." />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province.id} value={province.id}>
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldContent>
              </Field>

              {/* City */}
              <Field>
                <FieldLabel>Destination City</FieldLabel>
                <FieldDescription>Select the destination city</FieldDescription>
                <FieldContent>
                  <Controller
                    name="destinationCityId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          !selectedProvince || isLoadingCities || isEditing
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingCities
                                ? "Loading cities..."
                                : !selectedProvince
                                  ? "Select province first"
                                  : "Select city..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldContent>
              </Field>

              {/* Base Price */}
              <Field>
                <FieldLabel>Base Price (IDR)</FieldLabel>
                <FieldDescription>
                  Shipping cost to this destination
                </FieldDescription>
                <FieldContent>
                  <Controller
                    name="basePrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1000}
                        step={1000}
                        placeholder="e.g., 15000"
                        {...field}
                      />
                    )}
                  />
                </FieldContent>
              </Field>

              {/* Estimated Days */}
              <Field>
                <FieldLabel>Estimated Delivery Days</FieldLabel>
                <FieldDescription>
                  Optional: e.g., &quot;2-3&quot; or &quot;3-5&quot;
                </FieldDescription>
                <FieldContent>
                  <Controller
                    name="estimatedDays"
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="e.g., 2-3"
                        {...field}
                        value={field.value || ""}
                      />
                    )}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : isEditing
                    ? "Update Rate"
                    : "Create Rate"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
