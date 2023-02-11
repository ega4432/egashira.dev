import { defineCollection } from "astro:content";
import { noteScheme, articleScheme } from "./schemes";

export const collections = {
  notes: defineCollection(noteScheme),
  articles: defineCollection(articleScheme)
};
