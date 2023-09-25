import { getCollection, type CollectionEntry } from "astro:content";
import { dateSortDesc } from "@lib/utils/dateSortDesc";

export const getBlogs = async (): Promise<CollectionEntry<"blog">[]> => {
  return (await getCollection("blog")).sort((a, b) =>
    dateSortDesc(a.data.date, b.data.date)
  );
};

export const getTags = async () => {
  const tagsCount: Record<string, number> = {};
  const blogs = await getBlogs();
  if (blogs.length) {
    for (const blog of blogs) {
      const tags = blog.data.tags;

      for (const tag of tags) {
        if (tag in tagsCount) {
          tagsCount[tag] += 1;
        } else {
          tagsCount[tag] = 1;
        }
      }
    }
  }
  return tagsCount;
};
