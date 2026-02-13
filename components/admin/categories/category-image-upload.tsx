"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

interface CategoryImageUploadProps {
  currentImage?: {
    url: string;
    key: string;
  } | null;
  onImageUploaded: (data: { url: string; key: string }) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
}

export function CategoryImageUpload({
  currentImage,
  onImageUploaded,
  onImageRemoved,
  disabled = false,
}: CategoryImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImage?.url || null,
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_IMAGE_SIZE) {
      return "File too large. Maximum size is 2MB";
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
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
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/categories/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload image");
      }

      URL.revokeObjectURL(previewUrl);

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
    if (currentImage) {
      try {
        await fetch(
          `/api/categories/upload?key=${encodeURIComponent(currentImage.key)}`,
          { method: "DELETE" },
        );
      } catch (err) {
        console.error("Error removing image from R2:", err);
      }
    }

    setPreview(null);
    onImageRemoved();
  };

  const openFilePicker = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group">
          <div className="relative aspect-square w-full max-w-48 overflow-hidden rounded-lg border bg-muted">
            <Image
              src={preview}
              alt="Category image"
              fill
              className="object-cover"
              sizes="192px"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-sm font-medium">
                  Uploading...
                </div>
              </div>
            )}
          </div>

          {!disabled && !isUploading && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
              onClick={handleRemoveImage}
            >
              <X className="w-3 h-3 mr-1" />
              Remove
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "aspect-square w-full max-w-48 border-2 border-dashed rounded-lg p-4 text-center transition-colors flex flex-col items-center justify-center",
            isDragging && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer hover:border-primary/50",
          )}
          onClick={disabled ? undefined : openFilePicker}
        >
          <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Click or drag to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max 2MB. JPG, PNG, WebP
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
