import { defineCollection } from "astro:content";
import { noteScheme, blogScheme } from "./schemes";

export const collections = {
  notes: defineCollection(noteScheme),
  blog: defineCollection(blogScheme)
};
