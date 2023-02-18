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

export const authorScheme = {
  schema: z.object({
    name: z.string(),
    avatar: z.string(),
    occupation: z.string()
  })
};
