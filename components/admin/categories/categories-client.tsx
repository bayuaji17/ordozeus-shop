"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryList } from "@/components/admin/categories/category-list";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { CategoryFilters } from "@/components/admin/categories/category-filters";
import { Pagination } from "@/components/admin/pagination";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: number;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  childCount: number;
}

interface CategoriesClientProps {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function CategoriesClient({
  categories,
  pagination,
}: CategoriesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCategory(undefined);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
            <p className="text-muted-foreground">
              Organize products with hierarchical categories
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category List</CardTitle>
            <CardDescription>
              {pagination.total} categor{pagination.total !== 1 ? "ies" : "y"}{" "}
              in total
            </CardDescription>
            <div className="pt-4">
              <CategoryFilters />
            </div>
          </CardHeader>
          <CardContent>
            <CategoryList categories={categories} onEdit={handleEdit} />
          </CardContent>
        </Card>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          basePath="/admin/categories"
        />
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        category={editingCategory}
        allCategories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          level: c.level,
        }))}
        mode={editingCategory ? "edit" : "create"}
      />
    </>
  );
}
