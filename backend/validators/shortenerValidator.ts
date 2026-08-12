import { z } from "zod";

export const shortenerSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  shortCode: z.string().min(3).max(25).optional(),
});

export const shortenerUpdateSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  shortCode: z.string().min(3).max(25),
});

export const shortenerSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});
