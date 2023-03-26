import { defineConfig } from "astro/config";
import emoji from "remark-emoji";
import remarkFootnotes from "remark-footnotes";
import remarkMath from "remark-math";
import remarkLinkCard from "remark-link-card";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import { s } from "hastscript";
import tailwind from "@astrojs/tailwind";
import rehypePrismPlus from "rehype-prism-plus";
import image from "@astrojs/image";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";

import remarkCodeTitles from "./src/lib/utils/remark-code-titles";
import generateOgImage from "./src/integrations/generateOgImages";

let site = "http://localhost:3000";
if (process.env.CF_PAGES_BRANCH === "main") {
  site = "https://egashira.dev";
} else if (process.env.CF_PAGES_URL) {
  site = process.env.CF_PAGES_URL;
}

const anchorIcon = s(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    class: "anchor-icon"
  },
  [
    s("path", {
      stroke: "none",
      fill: "none",
      d: "M0 0h24v24H0z"
    }),
    s("path", {
      d: "M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5"
    }),
    s("path", {
      d: "M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5"
    })
  ]
);

const partytownConfig = {
  config: { forward: ["dataLayer.push"] }
};

export default defineConfig({
  integrations: [
    tailwind(),
    image(),
    sitemap(),
    partytown(partytownConfig),
    generateOgImage()
  ],
  markdown: {
    syntaxHighlight: "prism",
    remarkPlugins: [
      emoji,
      remarkMath,
      [
        remarkFootnotes,
        {
          inlineNotes: true
        }
      ],
      remarkCodeTitles,
      [remarkLinkCard, { shortenUrl: true }]
    ],
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
        rehypePrismPlus,
        {
          ignoreMissing: true
        }
      ]
    ]
  },
  site,
  build: {
    format: "file"
  }
});
