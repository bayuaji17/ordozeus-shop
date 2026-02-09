"use client";

import { useState, useEffect } from "react";
import { ProductImageCard } from "./product-image-card";
import { ProductImageUpload } from "./product-image-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  setPrimaryImage,
  updateImageAltText,
  deleteProductImage,
} from "@/lib/actions/product-images";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProductImageFull } from "@/lib/types";

interface ProductImagesGalleryProps {
  productId: string;
  initialImages: ProductImageFull[];
}

export function ProductImagesGallery({
  productId,
  initialImages,
}: ProductImagesGalleryProps) {
  const router = useRouter();
  const [images, setImages] = useState<ProductImageFull[]>(initialImages);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update images when initialImages changes
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleSetPrimary = async (imageId: string) => {
    setIsProcessing(true);
    try {
      const result = await setPrimaryImage({ imageId, productId });

      if (result.success) {
        // Optimistic update
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            isPrimary: img.id === imageId,
          })),
        );
        router.refresh();
        toast.success("Primary image updated");
      } else {
        toast.error(result.error || "Failed to set primary image");
      }
    } catch {
      toast.error("An error occurred while updating the primary image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    setIsProcessing(true);
    try {
      const result = await deleteProductImage({ imageId, productId });

      if (result.success) {
        // Optimistic update
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        router.refresh();
        toast.success("Image deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch {
      toast.error("An error occurred while deleting the image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateAltText = async (imageId: string, altText: string) => {
    try {
      const result = await updateImageAltText({ imageId, altText });

      if (result.success) {
        // Optimistic update
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? { ...img, altText } : img)),
        );
        router.refresh();
        toast.success("Alt text updated");
      } else {
        toast.error(result.error || "Failed to update alt text");
      }
    } catch {
      toast.error("An error occurred while updating alt text");
    }
  };

  const handleUploadSuccess = () => {
    router.refresh();
    toast.success("Images uploaded successfully");
  };

  return (
    <Tabs defaultValue="gallery" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="gallery">Gallery ({images.length})</TabsTrigger>
        <TabsTrigger value="upload">Upload Images</TabsTrigger>
      </TabsList>

      <TabsContent value="gallery" className="space-y-4">
        {images.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No images yet. Upload some images to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => (
              <ProductImageCard
                key={image.id}
                image={image}
                onSetPrimary={handleSetPrimary}
                onDelete={handleDelete}
                onUpdateAltText={handleUpdateAltText}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload">
        <ProductImageUpload
          productId={productId}
          currentImageCount={images.length}
          onUploadSuccess={handleUploadSuccess}
        />
      </TabsContent>
    </Tabs>
  );
}
