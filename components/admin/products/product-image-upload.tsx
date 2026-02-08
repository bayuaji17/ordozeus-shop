"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IMAGE_VALIDATION } from "@/lib/validations/product-images";
import { cn } from "@/lib/utils";

interface ProductImageUploadProps {
  productId: string;
  currentImageCount: number;
  onUploadSuccess: () => void;
  disabled?: boolean;
}

interface FileWithPreview {
  file: File;
  preview: string;
  error?: string;
}

export function ProductImageUpload({
  productId,
  currentImageCount,
  onUploadSuccess,
  disabled = false,
}: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFiles = IMAGE_VALIDATION.MAX_IMAGES_PER_PRODUCT - currentImageCount;

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > IMAGE_VALIDATION.MAX_FILE_SIZE) {
      return `File too large. Maximum size is 5MB`;
    }

    // Check file type
    if (!IMAGE_VALIDATION.ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, PNG, and WebP formats are allowed";
    }

    return null;
  }, []);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: FileWithPreview[] = [];
    const fileArray = Array.from(fileList);

    // Check total count
    if (files.length + fileArray.length > maxFiles) {
      setUploadError(`You can only upload ${maxFiles} more image(s)`);
      return;
    }

    for (const file of fileArray) {
      const error = validateFile(file);
      const preview = URL.createObjectURL(file);

      newFiles.push({
        file,
        preview,
        error: error || undefined,
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setUploadError(null);
  }, [files.length, maxFiles, validateFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    // Check for validation errors
    const hasErrors = files.some((f) => f.error);
    if (hasErrors) {
      setUploadError("Please remove invalid files before uploading");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("productId", productId);

      files.forEach((fileObj) => {
        formData.append("files", fileObj.file);
      });

      const response = await fetch("/api/products/images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload images");
      }

      // Show any partial errors
      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map((e: any) => `${e.fileName}: ${e.error}`).join("\n");
        setUploadError(`Some images failed:\n${errorMessages}`);
      }

      // Clean up previews
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setUploadProgress(100);

      // Notify parent
      onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging && "border-primary bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer hover:border-primary/50"
            )}
            onClick={disabled ? undefined : openFilePicker}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">
              {maxFiles > 0
                ? "Click or drag images to upload"
                : "Maximum images reached"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {maxFiles > 0
                ? `You can upload ${maxFiles} more image(s). Max 5MB per image.`
                : "Delete some images to upload more."}
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, WebP
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={IMAGE_VALIDATION.ACCEPTED_EXTENSIONS.join(",")}
              onChange={handleFileInputChange}
              disabled={disabled || maxFiles <= 0}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* File Previews */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </h3>
              <Button
                onClick={handleUpload}
                disabled={isUploading || disabled}
                size="sm"
              >
                {isUploading ? "Uploading..." : "Upload Images"}
              </Button>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <Progress value={uploadProgress} className="w-full" />
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive whitespace-pre-line">{uploadError}</p>
              </div>
            )}

            {/* File List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((fileObj, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={fileObj.preview}
                      alt={fileObj.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  {/* File Info */}
                  <div className="mt-2">
                    <p className="text-xs truncate">{fileObj.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {fileObj.error && (
                      <p className="text-xs text-destructive mt-1">{fileObj.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
