import { getCollection, type CollectionEntry } from "astro:content";
import { dateSortDesc } from "@lib/utils/dateSortDesc";

export const getBlogs = async (): Promise<CollectionEntry<"blog">[]> => {
  return (await getCollection("blog"))
    .filter((blog) => !blog.data.draft)
    .sort((a, b) => dateSortDesc(a.data.date, b.data.date));
};

export const getTags = async () => {
  const tagsCount: Record<string, number> = {};
  const normalizedTagsMap: Record<string, string> = {};
  const blogs = await getBlogs();
  if (blogs.length) {
    for (const blog of blogs) {
      const tags = blog.data.tags;

      for (const tag of tags) {
        const normalizedTag = tag.toLowerCase();
        if (normalizedTag in normalizedTagsMap) {
          const originalTag = normalizedTagsMap[normalizedTag];
          tagsCount[originalTag] += 1;
        } else {
          normalizedTagsMap[normalizedTag] = tag;
          tagsCount[tag] = 1;
        }
      }
    }
  }
  return tagsCount;
};
