import { input, select } from "@inquirer/prompts";
import { mkdir, writeFile } from "fs/promises";

const root = process.cwd();
const contentsDir = `${root}/src/content/blog`;
const minToc = `
## はじめに

## まとめ

## 参考
`;

const removeSpecificCharacter = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\- ] /g, "") //replace(/[^a-zA-Z0-9\- ]/g, ''
    .replace(/ /g, "-")
    .replace(/-+/g, "-");
};

const generateFrontmatter = ({
  title,
  date,
  tags,
  isDraft,
  summary
}: {
  title: string;
  date: string;
  tags: string[];
  isDraft: boolean;
  summary: string;
}) => {
  return `---
title: "${title}"
date: "${date}"
tags: [${tags}]
draft: ${isDraft}
summary: "${summary}"
---
`;
};

(async () => {
  const title = await input({
    message: "Enter post title:",
    default: "Untitled"
  });

  const date = await input({
    message: "Enter post date:",
    default: new Date()
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
      .replace(/\//g, "-")
  });

  const tags = await input({
    message: "Any tags? Separate them with , or leave empty if no tags."
  });
  const isDraft = await select({
    message: "Set post as draft?",
    choices: [
      { name: "Draft", value: true },
      { name: "Publish", value: false }
    ]
  });

  const summary = await input({ message: "Enter post summary:" });
  const slug = await input({
    message: "Enter post slug:",
    default: "untitled"
  });

  const frontmatter = generateFrontmatter({
    title,
    date,
    tags: tags
      .split(",")
      .filter((tag) => tag !== "")
      .map((tag) => `"${tag.trim()}"`),
    isDraft,
    summary
  });

  let targetDir = contentsDir;
  const targetFile = slug.slice(slug.lastIndexOf("/") + 1);
  if (slug.includes("/")) {
    targetDir += `/${slug.slice(0, slug.lastIndexOf("/"))}`;
    const resultDir = await mkdir(removeSpecificCharacter(targetDir), {
      recursive: true
    });
    if (!resultDir) throw new Error("failed to create directory");
  }

  await writeFile(
    removeSpecificCharacter(`${targetDir}/${targetFile}.md`),
    frontmatter + minToc,
    "utf-8"
  );
})().catch((e) => console.error(e));
