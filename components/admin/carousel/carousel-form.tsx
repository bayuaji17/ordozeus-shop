"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarouselImageUpload } from "./carousel-image-upload";
import { createCarousel, updateCarousel } from "@/lib/actions/carousel";
import {
  carouselSchema,
  type CarouselFormData,
} from "@/lib/validations/carousel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CarouselFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CarouselFormData> & {
    id?: string;
  };
}

type CarouselFormInput = z.input<typeof carouselSchema>;
type CarouselFormOutput = z.output<typeof carouselSchema>;

export function CarouselForm({ mode, initialData }: CarouselFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageData, setImageData] = useState<{
    url: string;
    key: string;
  } | null>(
    initialData?.imageUrl && initialData?.imageKey
      ? { url: initialData.imageUrl, key: initialData.imageKey }
      : null,
  );

  const form = useForm<CarouselFormInput, unknown, CarouselFormOutput>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      imageKey: initialData?.imageKey || "",
      ctaText: initialData?.ctaText || "",
      ctaLink: initialData?.ctaLink || "",
      displayOrder: initialData?.displayOrder || 0,
      status: initialData?.status || "inactive",
      startDate: initialData?.startDate
        ? new Date(initialData.startDate)
        : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      backgroundColor: initialData?.backgroundColor || "",
      textColor: initialData?.textColor || "",
    },
  });

  const onSubmit = async (data: CarouselFormOutput) => {
    const carouselId = initialData?.id;

    if (!imageData) {
      toast.error("Please upload an image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        ...data,
        imageUrl: imageData.url,
        imageKey: imageData.key,
      };

      let result;
      if (mode === "create") {
        result = await createCarousel(formData);
      } else {
        if (!carouselId) {
          toast.error("Carousel ID is missing");
          return;
        }
        result = await updateCarousel(carouselId, formData);
      }

      if (result.success) {
        toast.success(
          mode === "create"
            ? "Carousel created successfully"
            : "Carousel updated successfully",
        );
        router.push("/admin/carousel");
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Carousel Image</CardTitle>
        </CardHeader>
        <CardContent>
          <CarouselImageUpload
            currentImage={imageData}
            onImageUploaded={(data) => {
              setImageData(data);
              form.setValue("imageUrl", data.url);
              form.setValue("imageKey", data.key);
            }}
            onImageRemoved={() => {
              setImageData(null);
              form.setValue("imageUrl", "");
              form.setValue("imageKey", "");
            }}
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="carousel-title">Title *</FieldLabel>
                  <Input
                    {...field}
                    id="carousel-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter carousel title"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="subtitle"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="carousel-subtitle">Subtitle</FieldLabel>
                  <Input
                    {...field}
                    id="carousel-subtitle"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter subtitle (optional)"
                    value={field.value || ""}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="carousel-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="carousel-description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter description (optional)"
                    rows={4}
                    value={field.value || ""}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card>
        <CardHeader>
          <CardTitle>Call to Action</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="ctaText"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="carousel-cta-text">
                    Button Text
                  </FieldLabel>
                  <Input
                    {...field}
                    id="carousel-cta-text"
                    aria-invalid={fieldState.invalid}
                    placeholder='e.g., "Shop Now", "Learn More"'
                    value={field.value || ""}
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Text displayed on the call-to-action button
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="ctaLink"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="carousel-cta-link">
                    Button Link
                  </FieldLabel>
                  <Input
                    {...field}
                    id="carousel-cta-link"
                    type="url"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://example.com/page"
                    value={field.value || ""}
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    URL where the button should navigate to
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Status & Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="carousel-status">Status</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="carousel-status"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Active items are visible on the homepage
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex flex-col"
                  >
                    <FieldLabel htmlFor="carousel-start-date">
                      Start Date (Optional)
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="carousel-start-date"
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldDescription>
                      When to start showing this carousel
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex flex-col"
                  >
                    <FieldLabel htmlFor="carousel-end-date">
                      End Date (Optional)
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="carousel-end-date"
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldDescription>
                      When to stop showing this carousel
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Styling (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Styling (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="backgroundColor"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="carousel-bg-color">
                      Background Color
                    </FieldLabel>
                    <Input
                      {...field}
                      id="carousel-bg-color"
                      aria-invalid={fieldState.invalid}
                      placeholder="#000000 or transparent"
                      value={field.value || ""}
                      disabled={isSubmitting}
                    />
                    <FieldDescription>
                      Hex color or CSS color name
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="textColor"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="carousel-text-color">
                      Text Color
                    </FieldLabel>
                    <Input
                      {...field}
                      id="carousel-text-color"
                      aria-invalid={fieldState.invalid}
                      placeholder="#ffffff"
                      value={field.value || ""}
                      disabled={isSubmitting}
                    />
                    <FieldDescription>
                      Hex color or CSS color name
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !imageData}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
              ? "Create Carousel"
              : "Update Carousel"}
        </Button>
      </div>
    </form>
  );
}
