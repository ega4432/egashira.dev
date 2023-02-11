import { z } from "astro:content";

export const noteScheme = {
  schema: z.object({
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    isPublished: z.boolean()
  })
};

export const articleScheme = {
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean(),
    summary: z.string()
  })
};
