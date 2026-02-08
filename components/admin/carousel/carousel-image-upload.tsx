"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CAROUSEL_VALIDATION } from "@/lib/validations/carousel";
import { cn } from "@/lib/utils";

interface CarouselImageUploadProps {
  currentImage?: {
    url: string;
    key: string;
  } | null;
  onImageUploaded: (data: { url: string; key: string }) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
}

export function CarouselImageUpload({
  currentImage,
  onImageUploaded,
  onImageRemoved,
  disabled = false,
}: CarouselImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImage?.url || null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > CAROUSEL_VALIDATION.MAX_IMAGE_SIZE) {
      return `File too large. Maximum size is 5MB`;
    }

    // Check file type
    if (!CAROUSEL_VALIDATION.ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, PNG, and WebP formats are allowed";
    }

    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/carousel/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload image");
      }

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);

      // Update with actual uploaded image
      setPreview(result.data.url);
      onImageUploaded({
        url: result.data.url,
        key: result.data.key,
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setPreview(currentImage?.url || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImage) return;

    try {
      // Delete from R2
      await fetch(`/api/carousel/upload?key=${encodeURIComponent(currentImage.key)}`, {
        method: "DELETE",
      });

      setPreview(null);
      onImageRemoved();
    } catch (err) {
      console.error("Error removing image:", err);
      setError("Failed to remove image");
    }
  };

  const openFilePicker = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          {preview ? (
            // Image Preview
            <div className="relative group">
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={preview}
                  alt="Carousel preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-sm font-medium">
                      Uploading...
                    </div>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {!disabled && !isUploading && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          ) : (
            // Upload Area
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "aspect-[21/9] border-2 border-dashed rounded-lg p-8 text-center transition-colors flex flex-col items-center justify-center",
                isDragging && "border-primary bg-primary/5",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && "cursor-pointer hover:border-primary/50"
              )}
              onClick={disabled ? undefined : openFilePicker}
            >
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">
                Click or drag image to upload
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recommended size: 1920x800px. Max 5MB.
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WebP
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept={CAROUSEL_VALIDATION.ACCEPTED_EXTENSIONS.join(",")}
                onChange={handleFileInputChange}
                disabled={disabled}
                className="hidden"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Image Info */}
          {preview && !isUploading && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Image will be automatically optimized and converted to WebP format.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
