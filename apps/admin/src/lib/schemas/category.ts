import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and dashes"),
  description: z.string().trim().optional().transform((v) => v ?? ""),
  parentId: z.string().trim().optional().transform((v) => v ?? ""),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
