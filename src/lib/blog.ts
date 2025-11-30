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

/**
 * 現在の記事のタグ配列と比較し、共通タグ数が多い順に関連記事を取得する
 * @param currentTags 現在の記事のタグ配列
 * @param limit 取得する関連記事の最大件数（デフォルト5件）
 * @param excludeSlug 現在の記事のスラッグ（関連記事に含めないため）
 * @returns 関連記事の配列
 */
export const getRelatedBlogs = async (
  currentTags: string[],
  limit = 5,
  excludeSlug?: string
): Promise<CollectionEntry<"blog">[]> => {
  const blogs = await getBlogs();

  // 現在の記事のタグセットを作成（小文字化）
  const currentTagSet = new Set(currentTags.map((tag) => tag.toLowerCase()));

  // 各記事の共通タグ数を計算し、スコアとして保持
  const scoredBlogs = blogs
    .filter((blog) => blog.id !== excludeSlug)
    .map((blog) => {
      const blogTags = blog.data.tags.map((tag) => tag.toLowerCase());
      const commonCount = blogTags.filter((tag) =>
        currentTagSet.has(tag)
      ).length;
      return { blog, score: commonCount };
    })
    // 共通タグ数が0の記事は除外
    .filter(({ score }) => score > 0)
    // スコアの降順でソート
    .sort((a, b) => b.score - a.score)
    // limit件数に絞る
    .slice(0, limit)
    .map(({ blog }) => blog);

  return scoredBlogs;
};
