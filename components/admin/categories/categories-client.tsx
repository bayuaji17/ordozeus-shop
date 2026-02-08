"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryList } from "@/components/admin/categories/category-list";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { CategoryFilters } from "@/components/admin/categories/category-filters";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: "man" | "woman" | "unisex";
  isActive: boolean;
  productCount: number;
}

interface CategoriesClientProps {
  categories: Category[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

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
              Organize products by gender-based categories
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
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"} in
              total
            </CardDescription>
            <div className="pt-4">
              <CategoryFilters />
            </div>
          </CardHeader>
          <CardContent>
            <CategoryList categories={categories} onEdit={handleEdit} />
          </CardContent>
        </Card>
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        category={editingCategory}
        mode={editingCategory ? "edit" : "create"}
      />
    </>
  );
}
