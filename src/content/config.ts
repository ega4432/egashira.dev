import { defineCollection } from "astro:content";
import { authorScheme, blogScheme } from "./schemes";

export const collections = {
  author: defineCollection(authorScheme),
  blog: defineCollection(blogScheme)
};
