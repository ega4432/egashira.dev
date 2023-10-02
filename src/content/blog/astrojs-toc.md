---
summary: "remark, rehype などのプラグインを使わずに TOC を実装したのでその方法について書いておく。"
tags:
  - "Astro"
  - "Markdown"
date: "2023-10-02"
draft: false
title: "Astro で Table of Contents(目次)を実装する"
---

## はじめに

Astro で構築している当サイトに TOC を実装したくネットである程度調べたが remark や rehype プラグインを使う方法が多かった。しかし、Markdown や MDX で記事を書いている場合、それらのライブラリを使わずによりシンプルに実装できるので紹介がてら書いてみた。

## 解説

`astro:content` のユーティリティに含まれる `CollectionEntry<TCollectionName>` 型が持っている `render()` メソッドを介して `headings` プロパティを利用することで TOC(目次) を実現できる。

### 実装例

以下に簡単な実装例を示す。

```astro:./src/pages/blog/index.astro showLineNumbers
---
// `/blog/aaa`, `/blog/bbb` などのページを生成する関数
export const getStaticPaths = async () => {
  const blogs = await getCollection("blog");

  return blogs.map((blog) => {
    params: { slug: blog.slug },
    props: { blog }  // 各ページに渡す props を指定する( blog は `CollectionEntry<"blog">` 型)
  });
}

const { blog } = Astro.props;
const { Content, headings } = await blog.render();  // ここで取得できる
---

<div>
    <!-- markup here -->
</div>
```

このような形で簡単に目次に使いたい要素を Markdown や MDX から取得することが可能だ。

### headings プロパティについて

ちなみに `render()` メソッドから取得できる `headings` プロパティの型は `MarkdownHeading[]` で一例を示すとこのような形で取得できる。

```md
## はじめに

### ほげ

#### ふが
```

```json
[
  { "depth": 2, "slug": "はじめに", "text": "はじめに" },
  { "depth": 3, "slug": "ほげ", "text": "ほげ" },
  { "depth": 4, "slug": "ふが", "text": "ふが" }
]
```

## まとめ

前述した `headings` プロパティで目次を描画したい情報が取得できればあとは、コンポーネントを作るなり自由に UI を作ればいいだろう。

今回は、remark, rehype プラグインを使わずに TOC(目次)を実装する方法について解説した。詳しくは当サイトの[ソースコード](https://github.com/ega4432/egashira.dev/blob/main/src/pages/blog/%5B...slug%5D.astro)も置いておくのでもしよければこちらも参照いただければと思う。

## 参考

https://docs.astro.build/ja/reference/api-reference/#render
