import { defineCollection } from "astro:content";
import { pageScheme, blogScheme } from "./schemes";

export const collections = {
  page: defineCollection(pageScheme),
  blog: defineCollection(blogScheme)
};
