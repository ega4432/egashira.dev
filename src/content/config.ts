import { defineCollection } from "astro:content";
import { pageScheme, blogScheme } from "./schemes";

export const collections = {
  page: defineCollection({
    type: "content",
    schema: pageScheme
  }),
  blog: defineCollection({
    type: "content",
    schema: blogScheme
  })
};
