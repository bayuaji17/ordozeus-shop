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
import { deleteCategory, toggleCategoryStatus } from "@/lib/actions/categories";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: "man" | "woman" | "unisex";
  isActive: boolean;
  productCount: number;
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
}

function getTypeBadge(type: string) {
  const typeColors: Record<string, string> = {
    man: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    woman: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    unisex: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <Badge variant="outline" className={typeColors[type]}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
}

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    const result = await deleteCategory(categoryToDelete.id);

    if (result.success) {
      showSuccessToast.categoryDeleted();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      router.refresh();
    } else {
      if (result.error?.includes("assigned to")) {
        showErrorToast.categoryInUse();
      } else {
        showErrorToast.categoryDelete(result.error);
      }
    }
    setIsDeleting(false);
  };

  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    setIsTogglingStatus(categoryId);
    const result = await toggleCategoryStatus(categoryId, !currentStatus);

    if (result.success) {
      showSuccessToast.categoryUpdated();
      router.refresh();
    } else {
      showErrorToast.categoryUpdate(result.error);
    }
    setIsTogglingStatus(null);
  };

  if (categories.length === 0) {
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
        <h3 className="text-lg font-semibold mb-2">No categories found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get started by creating your first category
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Products</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {category.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getTypeBadge(category.type)}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{category.productCount} products</span>
                  </td>
                  <td className="px-4 py-3">
                    {category.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isTogglingStatus === category.id}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(category.id, category.isActive)}
                        >
                          {category.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCategoryToDelete(category);
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
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {category.slug}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isTogglingStatus === category.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(category.id, category.isActive)}
                  >
                    {category.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setCategoryToDelete(category);
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
            <div className="flex items-center gap-2">
              {getTypeBadge(category.type)}
              {category.isActive ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {category.productCount} products
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;?
              {categoryToDelete && categoryToDelete.productCount > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  This category is assigned to {categoryToDelete.productCount} product
                  {categoryToDelete.productCount > 1 ? "s" : ""} and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                isDeleting || (categoryToDelete?.productCount ?? 0) > 0
              }
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
