---
createdAt: "2023-02-05T03:04:00.000Z"
updatedAt: "2023-03-12T11:02:00.000Z"
summary: "静的サイト作るときはもうこれでいいかなとなっている。"
tags:
  - "Astro"
  - "TailwindCSS"
  - "Note"
date: "2023-02-05"
draft: false
title: "Astro を触っている"
---

## Astro

先日 v2 がリリースされ割とホットなのかなと思うので、このブログを Astro で書き換えようと着手している。

https://www.publickey1.jp/blog/23/astro_20content_cllectionsmarkdownhybrid_rendering.html

JS をできる限り排除できるのはやっぱり魅力的。

以下は着手している中での雑なメモ。

## Astro の Content Collections

公式のドキュメントはこれ。

https://docs.astro.build/en/guides/content-collections/

```sh
$ tree ./src/content
./src/content
├── config.ts
├── blog
│   ├── aaa.md
│   ├── bbb.md
│   └── ccc.md
└── schemes.ts
```

こんな感じで `./src/content` 配下に Markdown, MDX などのコンテンツを管理する Astro v2 で追加になった機能を使って実装してみている。`./src/content/scheme.ts` では Markdown の frontmatter の型定義をするようにした。

ページ側で Markdown を読み込むのも非常に簡単で、以下のようにするだけで画面に表示できた。

```astro title="blog.astro" showLineNumbers
---
import { getCollection } from "astro:content";

const allPosts = await getCollection("blog");
---
```
