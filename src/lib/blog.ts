import { getCollection } from "astro:content";
import { dateSortDesc } from "@lib/utils/dateSortDesc";

export const getBlogs = async () => {
  return (await getCollection("blog", ({ data }) => data.draft !== true)).sort(
    (a, b) => dateSortDesc(a.data.date, b.data.date)
  );
};
