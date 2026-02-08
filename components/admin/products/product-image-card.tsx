"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Trash2, Edit2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductImageCardProps {
  image: {
    id: string;
    url: string;
    fileName: string;
    altText: string | null;
    isPrimary: boolean;
    width: number | null;
    height: number | null;
  };
  onSetPrimary: (imageId: string) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
  onUpdateAltText: (imageId: string, altText: string) => Promise<void>;
  isProcessing?: boolean;
}

export function ProductImageCard({
  image,
  onSetPrimary,
  onDelete,
  onUpdateAltText,
  isProcessing = false,
}: ProductImageCardProps) {
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [altText, setAltText] = useState(image.altText || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [isSavingAlt, setIsSavingAlt] = useState(false);

  const handleSetPrimary = async () => {
    if (image.isPrimary) return;

    setIsSettingPrimary(true);
    try {
      await onSetPrimary(image.id);
    } finally {
      setIsSettingPrimary(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(image.id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAltText = async () => {
    setIsSavingAlt(true);
    try {
      await onUpdateAltText(image.id, altText);
      setIsEditingAlt(false);
    } finally {
      setIsSavingAlt(false);
    }
  };

  const handleCancelEdit = () => {
    setAltText(image.altText || "");
    setIsEditingAlt(false);
  };

  return (
    <>
      <Card className="overflow-hidden group">
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-square bg-muted">
            <Image
              src={image.url}
              alt={image.altText || image.fileName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 300px"
            />

            {/* Primary Badge */}
            {image.isPrimary && (
              <Badge className="absolute top-2 left-2">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Primary
              </Badge>
            )}

            {/* Action Buttons - Show on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.isPrimary && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSetPrimary}
                  disabled={isProcessing || isSettingPrimary}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Set Primary
                </Button>
              )}

              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isProcessing || isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Image Info */}
          <div className="p-3 space-y-2">
            {/* Alt Text */}
            {isEditingAlt ? (
              <div className="flex gap-2">
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Enter alt text..."
                  maxLength={255}
                  disabled={isSavingAlt}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveAltText}
                  disabled={isSavingAlt}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isSavingAlt}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{image.fileName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {image.altText || "No alt text"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingAlt(true)}
                  disabled={isProcessing}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* Dimensions */}
            {image.width && image.height && (
              <p className="text-xs text-muted-foreground">
                {image.width} × {image.height}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this image. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
