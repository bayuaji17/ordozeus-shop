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
import {
  SizeTypeList,
  type SizeTypeItem,
} from "@/components/admin/settings/size-type-list";
import { SizeTypeFormDialog } from "@/components/admin/settings/size-type-form-dialog";

interface SizeTypeSettingsClientProps {
  sizeTypes: SizeTypeItem[];
}

export function SizeTypeSettingsClient({
  sizeTypes,
}: SizeTypeSettingsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<SizeTypeItem | undefined>();

  const handleEdit = (sizeType: SizeTypeItem) => {
    setEditingType(sizeType);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingType(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingType(undefined);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Size Types</CardTitle>
              <CardDescription>
                Manage size categories (e.g., Clothing, Shoes). Create types
                before adding sizes.
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SizeTypeList sizeTypes={sizeTypes} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <SizeTypeFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        sizeType={editingType}
        mode={editingType ? "edit" : "create"}
      />
    </>
  );
}
