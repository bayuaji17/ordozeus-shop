import { z } from "zod";

export const sizeSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  sizeTypeId: z.string().uuid("Type is required"),
  sortOrder: z.number().int().min(0, "Must be 0 or greater"),
});

export type SizeFormData = z.infer<typeof sizeSchema>;
