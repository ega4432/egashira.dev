---
title: "Astro v5 へのアップグレード"
date: "2025-04-14"
tags: ["Astro", "Update"]
draft: false
summary: "本サイトで採用している Astro のバージョンを v4 から v5 へとアップグレードした際のメモ"
---

## はじめに

本サイトで採用している Astro のバージョンを v4 から v5 へとアップグレードした際にやったことを備忘録としてまとめておく。

実際の Pull Request はこちら。

https://github.com/ega4432/egashira.dev/pull/458

## アップグレード手順

### `@astrojs/upgrade` パッケージの利用

Astro は `@astrojs/upgrade` パッケージと言うのを公式が用意してくれている。

このパッケージは、CLI で依存ライブラリなどをインテグレーションしてくれるようになっている。詳細は下記を参照して欲しい。

https://www.npmjs.com/package/@astrojs/upgrade

https://github.com/withastro/astro/tree/main/packages/upgrade

実行した際は、`@astrojs/rss` や `@astrojs/sitemap` を同時にアップグレードしてくれた。

が、それで終了とはいかず、いくらかは手動で変更していく必要があったため、続きは後述する。

### Content Collection から Content Layer へ変更

v5 で入った破壊的な変更として大きなものと言えば Content Collection API だろう。

https://docs.astro.build/ja/guides/upgrade-to/v5/#legacy-v20-content-collections-api

Content Layer API を使う用に変える手順を下記に記載する。

- config ファイルの移動

```sh
$ mv ./src/content/config.ts ./src/content.config.ts
```

- コレクション定義の変更

`astro/loaders` から `glob` をインポートして、コレクションの場所（ベース）のフォルダと、コレクションエントリのファイル名と拡張子を定義するパターンの両方を指定する必要がある。

```diff:src/content.config.ts
export const collections = {
  page: defineCollection({
-   type: "content",
+   loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/page" }),
    schema: pageScheme
  }),
  blog: defineCollection({
-   type: "content",
+   loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
    schema: blogScheme
  })
};
```

- `slug` を `id` に変更

各所で slug フィールドを使っている箇所を id フィールドに変える。
`astro:content` の `CollectionEntry` 型に変更入っており slug フィールではなく id フィールドを返すようになっている。

```diff:src/pages/blog/[...slug].astro
export const getStaticPaths = async () => {
  const allBlogs = await getBlogs();

  return allBlogs.map((blog) => ({
-   params: { slug: blog.slug },
+   params: { slug: blog.id },
    props: { blog }
  }));
};
```

- `render` メソッドから `render` 関数に変更

上記同様 `CollectionEntry` 型から `render` メソッドがなくなったため別途 `astro:content` の `render` 関数を使うようにする。

```diff::src/pages/blog/[...slug].astro
const { blog } = Astro.props;

if (!blog) {
  return Astro.redirect('/404')
}
- const { Content, headings } = await blog.render();
+ const { Content, headings } = await render(blog);
```

### Astro の型定義ファイルの参照先変更

Astro v5 では、`.astro/types.d.ts` ファイルを型参照に使用するようになったため、それを tsconfig.json に設定する。

```diff:tsconfig.json
+ "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
```

## まとめ

以上、今回は本サイトに使用している Astro のバージョンを v5 へとメジャーアップグレードする際に行ったことをまとめてみた。

自分が特に行ったところにフォーカスしているので、今一度アップグレードする方は公式サイトを一読して欲しい。

## 参考

https://docs.astro.build/ja/guides/upgrade-to/v5/

https://zenn.dev/newgyu/articles/4b4ac29eb5398c

https://zenn.dev/mofmof_inc/articles/astro_upgrade_to_v5
