import { getBlogs } from "@lib/blog";
import { siteMeta } from "@constants";

export const GET = async () => {
  const blogs = await getBlogs();

  const blogLines = blogs.map((blog) => {
    const title = blog.data.title;
    const summary = blog.data.summary;
    const url = `/blog/${blog.id}`;
    if (!title || !url) return;
    return `- [${title}](${siteMeta.siteUrl}${url}): ${summary}`;
  });

  const body = `# ${siteMeta.title}

${siteMeta.description} ${siteMeta.author} の Web サイトです。

## ブログ記事

${blogLines.join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
