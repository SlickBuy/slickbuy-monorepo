import { z } from "zod";

export const imageUrl = z
  .string()
  .trim()
  .url({ message: "Must be a valid URL" });

export const csvImageUrls = z
  .string()
  .trim()
  .optional()
  .transform((val) => val ?? "")
  .refine(() => true);

export const createAuctionSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    images: z
      .string()
      .optional()
      .transform((v) => v ?? "")
      .refine(
        (val) => {
          const arr = val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          // allow empty
          return arr.every((u) => /^https?:\/\//i.test(u));
        },
        { message: "Images must be comma-separated URLs" }
      ),
    startingPrice: z
      .string()
      .min(1, "Starting price is required")
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
        message: "Enter a valid amount > 0",
      }),
    reservePrice: z
      .string()
      .optional()
      .transform((v) => v ?? "")
      .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), {
        message: "Enter a valid amount",
      }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    categoryId: z.string().trim().min(1, "Category is required"),
  })
  .superRefine((val, ctx) => {
    const start = Date.parse(val.startTime);
    const end = Date.parse(val.endTime);
    if (!isNaN(start) && !isNaN(end) && end <= start) {
      ctx.addIssue({
        path: ["endTime"],
        code: z.ZodIssueCode.custom,
        message: "End must be after start",
      });
    }
  });

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;

export function parseAuctionForm(data: Record<string, string>) {
  const parsed = createAuctionSchema.safeParse(data);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const e of parsed.error.issues) {
      const key = String(e.path[0] ?? "form");
      if (!errors[key]) errors[key] = e.message;
    }
    return { ok: false as const, errors };
  }
  return { ok: true as const, data: parsed.data };
}
