"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Edit, Trash2, MoreVertical, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteProduct, toggleProductStatus } from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

interface ProductDetailHeaderProps {
  product: {
    id: string;
    name: string;
    status: "draft" | "active" | "archived";
  };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="default">Active</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "archived":
      return <Badge variant="outline">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteProduct(product.id);

    if (result.success) {
      showSuccessToast.productDeleted();
      router.push("/admin/products");
    } else {
      showErrorToast.productDelete(result.error);
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (
    status: "draft" | "active" | "archived",
  ) => {
    setIsUpdatingStatus(true);
    const result = await toggleProductStatus(product.id, status);

    if (result.success) {
      showSuccessToast.productStatusUpdated();
      router.refresh();
    } else {
      showErrorToast.generic(result.error);
    }
    setIsUpdatingStatus(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(product.status)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={isUpdatingStatus}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleStatusChange("active")}
                disabled={product.status === "active"}
              >
                Set as Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("draft")}
                disabled={product.status === "draft"}
              >
                Set as Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("archived")}
                disabled={product.status === "archived"}
              >
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{product.name}&quot;? This
              will set the product status to archived.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
