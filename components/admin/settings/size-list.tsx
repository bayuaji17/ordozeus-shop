"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { deleteSize } from "@/lib/actions/sizes";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

export interface SizeItem {
  id: string;
  name: string;
  sizeTypeId: string;
  sizeTypeName: string;
  sortOrder: number;
  productCount: number;
}

interface SizeListProps {
  grouped: Record<string, SizeItem[]>;
  onEdit: (size: SizeItem) => void;
}

export function SizeList({ grouped, onEdit }: SizeListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState<SizeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeNames = Object.keys(grouped).sort();

  const handleDelete = async () => {
    if (!sizeToDelete) return;

    setIsDeleting(true);
    const result = await deleteSize(sizeToDelete.id);

    if (result.success) {
      showSuccessToast.sizeDeleted();
      setDeleteDialogOpen(false);
      setSizeToDelete(null);
      router.refresh();
    } else {
      if (result.error?.includes("used by")) {
        showErrorToast.sizeInUse();
      } else {
        showErrorToast.sizeDelete(result.error);
      }
    }
    setIsDeleting(false);
  };

  if (typeNames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No sizes yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get started by adding your first size
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {typeNames.map((type) => {
          const sizes = grouped[type];
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {type}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {sizes.length}
                </Badge>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Sort Order
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Products
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size) => (
                      <tr
                        key={size.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium uppercase">
                            {size.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">
                            {size.sortOrder}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">
                            {size.productCount} product
                            {size.productCount !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(size)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSizeToDelete(size);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {sizes.map((size) => (
                  <div
                    key={size.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{size.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Order: {size.sortOrder}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(size)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSizeToDelete(size);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {size.productCount} product
                      {size.productCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Size</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{sizeToDelete?.name}&quot;?
              {sizeToDelete && sizeToDelete.productCount > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  This size is used by {sizeToDelete.productCount} product
                  {sizeToDelete.productCount > 1 ? "s" : ""} and cannot be
                  deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || (sizeToDelete?.productCount ?? 0) > 0}
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
