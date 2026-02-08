"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { MoreVertical, Edit, Trash2, Eye, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteCarousel, toggleCarouselStatus } from "@/lib/actions/carousel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CarouselCardProps {
  carousel: {
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string;
    status: "active" | "inactive" | "scheduled";
    displayOrder: number;
    startDate: Date | null;
    endDate: Date | null;
    ctaText: string | null;
    ctaLink: string | null;
    createdAt: Date;
  };
}

export function CarouselCard({ carousel }: CarouselCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCarousel({ id: carousel.id });

      if (result.success) {
        toast.success("Carousel deleted successfully");
        router.refresh();
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Failed to delete carousel");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    try {
      const newStatus = carousel.status === "active" ? "inactive" : "active";
      const result = await toggleCarouselStatus({
        id: carousel.id,
        status: newStatus,
      });

      if (result.success) {
        toast.success(
          `Carousel ${newStatus === "active" ? "activated" : "deactivated"}`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const getStatusBadge = () => {
    switch (carousel.status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          {/* Image Preview */}
          <div className="relative aspect-[21/9] bg-muted">
            <Image
              src={carousel.imageUrl}
              alt={carousel.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Order Badge */}
            <Badge className="absolute top-2 left-2" variant="secondary">
              #{carousel.displayOrder}
            </Badge>

            {/* Status Badge */}
            <div className="absolute top-2 right-2">{getStatusBadge()}</div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title & Subtitle */}
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">
                {carousel.title}
              </h3>
              {carousel.subtitle && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {carousel.subtitle}
                </p>
              )}
            </div>

            {/* Scheduling Info */}
            {(carousel.startDate || carousel.endDate) && (
              <div className="text-xs text-muted-foreground space-y-1">
                {carousel.startDate && (
                  <p>Start: {format(new Date(carousel.startDate), "PPP")}</p>
                )}
                {carousel.endDate && (
                  <p>End: {format(new Date(carousel.endDate), "PPP")}</p>
                )}
              </div>
            )}

            {/* CTA Info */}
            {carousel.ctaText && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="text-xs">
                  CTA: {carousel.ctaText}
                </Badge>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                {format(new Date(carousel.createdAt), "MMM d, yyyy")}
              </span>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus}
                >
                  <Power className="w-4 h-4 mr-1" />
                  {carousel.status === "active" ? "Deactivate" : "Activate"}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/carousel/${carousel.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Carousel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{carousel.title}" and remove the image
              from storage. This action cannot be undone.
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
