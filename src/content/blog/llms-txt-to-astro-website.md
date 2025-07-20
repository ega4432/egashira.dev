---
title: "AI 時代のサイト最適化のため LLMs.txt を導入した"
date: "2025-07-20"
tags: ["AI", "LLM", "Astro"]
draft: false
summary: "当サイトに導入したので Astro で構築されたサイトへの実装方法について記載する"
---

## はじめに

LLMs.txt とは、AI クローラーに対してそのサイトやサービスのコンテンツを効率的に扱ってもらうためのファイルである。

大規模言語モデル（LLM: Large Language Model）はインターネット上の情報へ依存度が高いが、Web サイトには広告、ナビゲーション、JavaScript といったものが多く含まれており、LLM が解釈するには複雑で、プレーンテキストとして抽出するにはノイズが多く容易ではない。

そこで、AI にサイト内のコンテンツを理解しやすくするため誕生したのがこの LLMs.txt ということだ。

https://llmstxt.org/

従来だと、検索エンジンのクローラ向けに `robots.txt` があったり、クローラにインデックスして欲しい URL を伝えるために `sitemap.xml` を作成したりしていたと思うが、今回は対 LLM 向けということだ。

## Astor サイトへの実装方法

当サイトは Astro フレームワークで構築しているため、その前提での実装方法になるのはご了承いただきたい。

`src/pages/llms.txt.ts` にファイルを作成し、以下のように(AI が)実装した。

```ts:src/pages/llms.txt.ts
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

${siteMeta.description} ${siteMeta.author} の Web サイトである。

## ブログ記事

${blogLines.join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
```

このようにすると `/llms.txt` に下記のようなテキストファイルが生成される。

```txt:llms.txt
# egashira.dev

外資系企業で働く防衛大卒のプリセールスエンジニア ega4432 の Web サイトです。

## ブログ記事

- [AI クローラー向けに llms.txt を導入した](https://egashira.dev/blog/llms-txt-to-astro-website): 当サイトに導入したので Astro で構築されたサイトへの実装方法について記載する
- [Terraform Associate に合格した](https://egashira.dev/blog/passed-terraform-associate): Terraform Associate を受験した際の学習方法や受験体験、感想などをまとめる。
- [Ansible で作るおうち Kubernetes](https://egashira.dev/blog/2025-kubernetes-at-home): Raspberry Pi 3 台を使って自宅に Kubernetes クラスタを構築するいわゆる「おうち Kubernetes」を Ansible で実装した
- [Astro 製のサイトに Mermaid 記法を導入する](https://egashira.dev/blog/mermaid-drawing-with-astro): Astro 製のこのサイトに Mermaid 記法を導入してみたので手順をまとめてみた
- [HCP Terraform を導入するメリットを整理してみた](https://egashira.dev/blog/hcp-terraform-benefits): Terraform の SaaS 版である HCP Terraform を導入することで得られる主要なメリットと、どのようなケースで導入を検討すべきかを考えてみた
...
```

改めて感じたところだが、Astro は静的サイトジェネレータとして非常にシンプルで、また TypeScript で書けるので Vibe Coding をしていて非常に楽に実装できた。

https://github.com/ega4432/egashira.dev/pull/522

## まとめ

LLMs.txt の種類としては、`llms.txt`, `llms-full.txt` と 2 パターンがあるらしいが、今回は前者だけ対応した。

LLM がインターネット上から様々な情報を取得する世の中になった今、LLM フレンドリーな Web サイト構築が求められているかもしれない。

完成した LLMs.txt ↓

https://egashira.dev/llms.txt

## 参考

https://llmstxt.org/

https://directory.llmstxt.cloud/llms.text

https://zenn.dev/minedia/articles/llmtxt-in-action

https://zenn.dev/watany/articles/0b28a68a2dffc3
