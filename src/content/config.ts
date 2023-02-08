import { defineCollection } from "astro:content";
import { noteScheme } from "./schemes";

export const collections = {
	notes: defineCollection(noteScheme)
};
