import { z } from "zod";

export const sizeTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  sortOrder: z.number().int().min(0, "Must be 0 or greater"),
});

export type SizeTypeFormData = z.infer<typeof sizeTypeSchema>;
