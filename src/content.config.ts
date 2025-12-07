import { defineCollection } from "astro:content";
import { pageScheme, blogScheme } from "./content/schemes";
import { glob } from "astro/loaders";

export const collections = {
  page: defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/page" }),
    schema: pageScheme
  }),
  blog: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
    schema: blogScheme
  })
};
