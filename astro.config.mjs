import { defineConfig } from "astro/config";
import { transformerNotationDiff } from "@shikijs/transformers";
import emoji from "remark-emoji";
import remarkMath from "remark-math";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import { rehypePrettyCode } from "rehype-pretty-code";
import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import { siteMeta } from "./src/constants";
import generateOgImage from "./src/integrations/generateOgImages";
import remarkLinkCard from "./src/lib/utils/remark-plugins/remark-link-card";
import { anchorIcon } from "./src/lib/utils/rehype-plugins/rehype-auto-link-headings";
import rehypeMermaid from "rehype-mermaid";

let site = "http://localhost:4321";
if (process.env.CF_PAGES_BRANCH === "main") {
  site = siteMeta.siteUrl;
} else if (process.env.CF_PAGES_URL) {
  site = process.env.CF_PAGES_URL;
}

const partytownConfig = {
  config: { forward: ["dataLayer.push"] }
};

export default defineConfig({
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !page.startsWith(`${site}/tags`)
    }),
    partytown(partytownConfig),
    generateOgImage(),
    icon()
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [emoji, remarkMath, remarkLinkCard],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          content: anchorIcon
        }
      ],
      rehypeKatex,
      [
        rehypeMermaid,
        {
          strategy: "img-svg",
          dark: {
            theme: "dark",
            fontFamily: "sans-serif"
          }
        }
      ],
      [
        rehypePrettyCode,
        {
          theme: "github-dark-default",
          transformers: [transformerNotationDiff()]
        }
      ]
    ]
  },
  site,
  build: {
    format: "file"
  }
});
