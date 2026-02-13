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
import { deleteSizeType } from "@/lib/actions/size-types";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

export interface SizeTypeItem {
  id: string;
  name: string;
  sortOrder: number;
  sizeCount: number;
}

interface SizeTypeListProps {
  sizeTypes: SizeTypeItem[];
  onEdit: (sizeType: SizeTypeItem) => void;
}

export function SizeTypeList({ sizeTypes, onEdit }: SizeTypeListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<SizeTypeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!typeToDelete) return;

    setIsDeleting(true);
    const result = await deleteSizeType(typeToDelete.id);

    if (result.success) {
      showSuccessToast.sizeTypeDeleted();
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
      router.refresh();
    } else {
      if (result.error?.includes("used by")) {
        showErrorToast.sizeTypeInUse();
      } else {
        showErrorToast.sizeTypeDelete(result.error);
      }
    }
    setIsDeleting(false);
  };

  if (sizeTypes.length === 0) {
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No size types yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add size types first (e.g., Clothing, Shoes) before creating sizes
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Sort Order
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Sizes</th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sizeTypes.map((sizeType) => (
              <tr
                key={sizeType.id}
                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-medium capitalize">
                    {sizeType.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {sizeType.sortOrder}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">
                    {sizeType.sizeCount} size
                    {sizeType.sizeCount !== 1 ? "s" : ""}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(sizeType)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTypeToDelete(sizeType);
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
        {sizeTypes.map((sizeType) => (
          <div key={sizeType.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{sizeType.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Order: {sizeType.sortOrder}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(sizeType)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setTypeToDelete(sizeType);
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
            <Badge variant="secondary">
              {sizeType.sizeCount} size{sizeType.sizeCount !== 1 ? "s" : ""}
            </Badge>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Size Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{typeToDelete?.name}&quot;?
              {typeToDelete && typeToDelete.sizeCount > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  This type has {typeToDelete.sizeCount} size
                  {typeToDelete.sizeCount > 1 ? "s" : ""} and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || (typeToDelete?.sizeCount ?? 0) > 0}
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
