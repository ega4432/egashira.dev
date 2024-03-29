import { z } from "astro:content";

export const blogScheme = z.object({
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()),
  draft: z.boolean(),
  summary: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const pageScheme = z.object({
  name: z.string(),
  occupation: z.string().optional(),
  updatedAd: z.string().optional()
});
