---
createdAt: "2023-02-05T03:04:00.000Z"
updatedAt: "2023-03-03T11:04:00.000Z"
summary: "静的サイト作るときはもうこれでいいかなとなっている。"
tags:
  - "Astro"
  - "TailwindCSS"
date: "2023-02-05"
draft: false
title: "Astro で遊んだ"
---

## Astro の Content Collections

公式のドキュメントはこれ。

[https://docs.astro.build/en/guides/content-collections/](https://docs.astro.build/en/guides/content-collections/)

```shell
tree ./src/content
./src/content
├── config.ts
├── blog
│   ├── aaa.md
│   ├── bbb.md
│   ├── ccc.md
└── schemes.ts
```

こんな感じで `./src/content` 配下に Markdown, MDX などのコンテンツを管理する Astro v2 で追加になった機能を使って実装してみている。`./src/content/scheme.ts` では Markdown の frontmatter の型定義をするようにした。

ページ側で Markdown を読み込むのも非常に簡単で、以下のようにするだけで画面に表示できた。

```typescript
---
import { getCollection } from "astro:content";

const allPosts = await getCollection("blog");
---
```

## 読書

「節約・貯蓄・投資の前に　今さら聞けないお金の超基本」を読んでいる。

[https://www.amazon.co.jp/dp/B07KWSF8QF](https://www.amazon.co.jp/dp/B07KWSF8QF)

今までお金の管理をちゃんとやってこなかった（特に費やすものがなくそこまで必要がなかった）ので、今後は少しちゃんとしようと思って入門書を手にとって読んでる。基本的な事が多くすでに実践していることも多いが、脳内にインデックスが貼れたので「何だったけ？」ってなったらこの本見返すと早そう。
