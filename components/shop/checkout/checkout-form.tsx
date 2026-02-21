"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
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
import { PaymentMethodCard } from "./payment-method-card";
import { LocationSelector, LocationDetails } from "./location-selector";
import { useCheckoutStore } from "@/lib/stores/checkout-store";
import { useCartStore } from "@/lib/stores/cart-store";
import type { CustomerInfo } from "@/lib/types/checkout";

interface LocationOption {
  id: number;
  label: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  zipCode: string;
}

const locationSchema = z.object({
  id: z.number(),
  label: z.string(),
  province: z.string(),
  city: z.string(),
  district: z.string(),
  subdistrict: z.string(),
  zipCode: z.string(),
});

const checkoutSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(10, "Full address is required"),
  location: locationSchema.refine((val) => val != null, {
    message: "Please select a location",
  }),
  paymentMethod: z.enum(["bank_transfer", "midtrans"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setCustomerInfo, setPaymentMethod } = useCheckoutStore();
  const { getSummary } = useCartStore();
  const summary = getSummary();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "bank_transfer",
    },
  });

  const selectedPayment = useWatch({ control, name: "paymentMethod" });
  const selectedLocation = useWatch({ control, name: "location" });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    // Save to store with full location details
    const customerInfo: CustomerInfo = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      province: data.location.province,
      city: data.location.city,
      district: data.location.district,
      subdistrict: data.location.subdistrict,
      postalCode: data.location.zipCode,
      destinationId: data.location.id,
    };

    setCustomerInfo(customerInfo);
    setPaymentMethod(data.paymentMethod);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Redirect to confirmation
    router.push("/checkout/confirmation");
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

          <Field>
            <FieldLabel>
              Location
              <span className="text-destructive ml-1">*</span>
            </FieldLabel>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <LocationSelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.location && (
              <FieldError errors={[{ message: errors.location.message }]} />
            )}
          </Field>

          {/* Display selected location details */}
          {selectedLocation && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-900">
                Selected Location Details
              </p>
              <LocationDetails location={selectedLocation} />
            </div>
          )}
        </FieldSet>

        <Separator />

        {/* Payment Method */}
        <FieldSet>
          <FieldLegend>Payment Method</FieldLegend>

          <div className="space-y-3">
            <PaymentMethodCard
              method="bank_transfer"
              selected={selectedPayment === "bank_transfer"}
              onSelect={() => setValue("paymentMethod", "bank_transfer")}
            />
            <PaymentMethodCard
              method="midtrans"
              selected={selectedPayment === "midtrans"}
              onSelect={() => setValue("paymentMethod", "midtrans")}
            />
          </div>

          {errors.paymentMethod && (
            <FieldError errors={[{ message: errors.paymentMethod.message }]} />
          )}
        </FieldSet>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-black text-white hover:bg-slate-800 rounded-full h-12 text-base font-medium"
        >
          {isSubmitting ? "Processing..." : `Complete Order - ${formatCurrency(summary.subtotal)}`}
        </Button>
      </FieldGroup>
    </form>
  );
}

// Helper function for formatting
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
