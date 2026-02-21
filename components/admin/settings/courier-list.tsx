"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
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
import { deleteCourier } from "@/lib/actions/couriers";
import { toast } from "sonner";

export interface CourierItem {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CourierListProps {
  couriers: CourierItem[];
  onEdit: (courier: CourierItem) => void;
}

export function CourierList({ couriers, onEdit }: CourierListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courierToDelete, setCourierToDelete] = useState<CourierItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (courier: CourierItem) => {
    setCourierToDelete(courier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courierToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteCourier(courierToDelete.id);
      if (result.success) {
        toast.success(`Courier "${courierToDelete.name}" deleted successfully`);
        setDeleteDialogOpen(false);
        setCourierToDelete(null);
      } else {
        toast.error(result.error || "Failed to delete courier");
      }
    } catch {
      toast.error("An error occurred while deleting the courier");
    } finally {
      setIsDeleting(false);
    }
  };

  if (couriers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No couriers found</h3>
        <p className="text-muted-foreground mt-1">
          Add your first courier to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {couriers.map((courier) => (
            <TableRow key={courier.id}>
              <TableCell className="font-medium capitalize">
                {courier.name}
              </TableCell>
              <TableCell className="font-mono text-sm uppercase">
                {courier.code}
              </TableCell>
              <TableCell>
                <Badge variant={courier.isActive ? "default" : "secondary"}>
                  {courier.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(courier)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(courier)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Courier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{courierToDelete?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
