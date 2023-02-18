import { defineCollection } from "astro:content";
import { blogScheme } from "./schemes";

export const collections = {
  blog: defineCollection(blogScheme)
};
