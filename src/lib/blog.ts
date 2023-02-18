import { getCollection } from "astro:content";
import { dateSortDesc } from "@lib/utils/dateSortDesc";

export const getBlogs = async () => {
  return (await getCollection("blog")).sort((a, b) =>
    dateSortDesc(a.data.date, b.data.date)
  );
};
