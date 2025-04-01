import rss from "@astrojs/rss";

import { getBlogs } from "@lib/blog";

export const GET = async (context) => {
  const site = new URL("blog", context.site).href;
  const blogs = await getBlogs();
  const me = "hello@egashira.dev (ega4432)";
  const lang = "<language>ja-jp</language>";
  const lastBuildDate = `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

  return rss({
    title: "egashira.dev",
    description: "外資系企業で働く防衛大卒のソフトウェアエンジニア",
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    site,
    items: blogs.map((blog) => ({
      link: `${site}/${blog.slug}`,
      description: blog.data.summary || undefined,
      title: blog.data.title,
      pubDate: new Date(blog.data.date),
      customData: `<author>${me}</author>${blog.data.tags
        .map((tag) => `<category>${tag}</category>`)
        .join("")}`
    })),
    customData: `<webMaster>${me}</webMaster><managingEditor>${me}</managingEditor>${lastBuildDate}${lang}`
  });
};
