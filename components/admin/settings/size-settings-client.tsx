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
import { SizeList, type SizeItem } from "@/components/admin/settings/size-list";
import { SizeFormDialog } from "@/components/admin/settings/size-form-dialog";

interface SizeSettingsClientProps {
  sizes: SizeItem[];
  grouped: Record<string, SizeItem[]>;
  sizeTypes: { id: string; name: string }[];
}

export function SizeSettingsClient({
  grouped,
  sizeTypes,
}: SizeSettingsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<SizeItem | undefined>();

  const handleEdit = (size: SizeItem) => {
    setEditingSize(size);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingSize(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingSize(undefined);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sizes</CardTitle>
              <CardDescription>
                Manage size options available for products. Sizes are grouped by
                type.
              </CardDescription>
            </div>
            <Button onClick={handleCreate} disabled={sizeTypes.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SizeList grouped={grouped} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <SizeFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        size={editingSize}
        sizeTypes={sizeTypes}
        mode={editingSize ? "edit" : "create"}
      />
    </>
  );
}
