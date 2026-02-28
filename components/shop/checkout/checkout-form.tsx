"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { CheckoutLocationForm } from "./checkout-location-form";
import { useCheckoutStore } from "@/lib/stores/checkout-store";
import { useCartStore } from "@/lib/stores/cart-store";
import type { CustomerInfo } from "@/lib/types/checkout";
import { formatCurrency } from "@/lib/currency";

const locationSchema = z.object({
  provinceId: z.string().min(1),
  provinceName: z.string().min(1),
  cityId: z.string().min(1),
  cityName: z.string().min(1),
  districtId: z.string().min(1),
  districtName: z.string().min(1),
  villageId: z.string().min(1),
  villageName: z.string().min(1),
  postalCode: z.string().min(1, "Postal code is required"),
});

const checkoutSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.email("Valid email is required"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(10, "Full address is required"),
    location: locationSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location"],
        message: "Please select a complete location (province → village)",
      });
    }
  });

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  provinces: { id: string; name: string }[];
}

export function CheckoutForm({ provinces }: CheckoutFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { shippingCost } = useCheckoutStore();
  const { getSummary } = useCartStore();
  const summary = getSummary();
  const total = summary.subtotal + (shippingCost ?? 0);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      const loc = data.location!;

      const customerInfo: CustomerInfo = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        province: loc.provinceName,
        city: loc.cityName,
        district: loc.districtName,
        subdistrict: loc.villageName,
        postalCode: loc.postalCode || "",
      };

      const origin = window.location.origin;
      const payload = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: `${customerInfo.address}, ${customerInfo.subdistrict}, ${customerInfo.district}`,
        shippingCity: customerInfo.city,
        shippingProvince: customerInfo.province,
        shippingPostalCode: customerInfo.postalCode,
        shippingCost: shippingCost ?? 0,
        items: useCartStore.getState().items.map((item) => ({
          productId: item.productId,
          sizeId: item.sizeId || undefined,
          sizeName: item.sizeName || undefined,
          quantity: item.quantity,
        })),
        returnUrl: `${origin}/checkout/confirmation`,
        cancelUrl: `${origin}/checkout`,
        notifyUrl: `${origin}/api/webhooks/ipaymu`,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Checkout failed:", errorData);
        alert("Failed to create order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const { orderId } = await res.json();

      // Clear cart now that order is safely stored in DB
      useCartStore.getState().clearCart();

      // Redirect to confirmation page — iPaymu button lives there
      router.push(`/checkout/confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error("Order submit Error:", err);
      alert("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-8">
        {/* Contact Information */}
        <FieldSet>
          <FieldLegend>Contact Information</FieldLegend>

          <Field>
            <FieldLabel>
              Full Name
              <span className="text-destructive ml-1">*</span>
            </FieldLabel>
            <Input
              placeholder="John Doe"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <FieldError errors={[{ message: errors.name.message }]} />
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>
                Email
                <span className="text-destructive ml-1">*</span>
              </FieldLabel>
              <Input
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <FieldError errors={[{ message: errors.email.message }]} />
              )}
            </Field>

            <Field>
              <FieldLabel>
                Phone Number
                <span className="text-destructive ml-1">*</span>
              </FieldLabel>
              <Input
                type="tel"
                placeholder="081234567890"
                {...register("phone")}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <FieldError errors={[{ message: errors.phone.message }]} />
              )}
            </Field>
          </div>
        </FieldSet>

        <Separator />

        {/* Shipping Address */}
        <FieldSet>
          <FieldLegend>Shipping Address</FieldLegend>

          <Field>
            <FieldLabel>
              Full Address
              <span className="text-destructive ml-1">*</span>
            </FieldLabel>
            <Textarea
              placeholder="Jl. Sudirman No. 123, RT.001/RW.002"
              rows={3}
              {...register("address")}
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <FieldError errors={[{ message: errors.address.message }]} />
            )}
          </Field>

          {/* Cascading Location Selector */}
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <CheckoutLocationForm
                provinces={provinces}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val === null ? undefined : val);
                  void trigger("location");
                }}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.location && (
            <FieldError errors={[{ message: errors.location.message }]} />
          )}
        </FieldSet>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-black text-white hover:bg-slate-800 rounded-full h-12 text-base font-medium"
        >
          {isSubmitting
            ? "Processing..."
            : `Place Order - ${formatCurrency(total)}`}
        </Button>
      </FieldGroup>
    </form>
  );
}
