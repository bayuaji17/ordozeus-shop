"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarouselImageUpload } from "./carousel-image-upload";
import { createCarousel, updateCarousel } from "@/lib/actions/carousel";
import { carouselSchema, type CarouselFormData } from "@/lib/validations/carousel";
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

export function CarouselForm({ mode, initialData }: CarouselFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageData, setImageData] = useState<{
    url: string;
    key: string;
  } | null>(
    initialData?.imageUrl && initialData?.imageKey
      ? { url: initialData.imageUrl, key: initialData.imageKey }
      : null
  );

  const form = useForm<CarouselFormData>({
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
      startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      backgroundColor: initialData?.backgroundColor || "",
      textColor: initialData?.textColor || "",
    },
  });

  const onSubmit = async (data: CarouselFormData) => {
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
        result = await updateCarousel(initialData?.id!, formData);
      }

      if (result.success) {
        toast.success(
          mode === "create"
            ? "Carousel created successfully"
            : "Carousel updated successfully"
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
    <Form {...form}>
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
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter carousel title"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter subtitle (optional)"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description (optional)"
                      rows={4}
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardHeader>
            <CardTitle>Call to Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="ctaText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., "Shop Now", "Learn More"'
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Text displayed on the call-to-action button
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ctaLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Link</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/page"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    URL where the button should navigate to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Status & Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Scheduling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Active items are visible on the homepage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When to start showing this carousel
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When to stop showing this carousel
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Styling (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Styling (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="#000000 or transparent"
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Hex color or CSS color name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="#ffffff"
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Hex color or CSS color name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
    </Form>
  );
}
