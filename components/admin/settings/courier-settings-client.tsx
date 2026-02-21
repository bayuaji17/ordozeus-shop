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
  CourierList,
  type CourierItem,
} from "@/components/admin/settings/courier-list";
import {
  CourierFormDialog,
} from "@/components/admin/settings/courier-form-dialog";

interface CourierSettingsClientProps {
  couriers: CourierItem[];
}

export function CourierSettingsClient({
  couriers,
}: CourierSettingsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<CourierItem | undefined>();

  const handleEdit = (courier: CourierItem) => {
    setEditingCourier(courier);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCourier(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCourier(undefined);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Couriers</CardTitle>
              <CardDescription>
                Manage shipping couriers available for your store.
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Courier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CourierList couriers={couriers} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <CourierFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        courier={editingCourier}
        mode={editingCourier ? "edit" : "create"}
      />
    </>
  );
}
