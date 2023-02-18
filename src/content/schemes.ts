import { z } from "astro:content";

export const blogScheme = {
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean(),
    summary: z.string()
  })
};
