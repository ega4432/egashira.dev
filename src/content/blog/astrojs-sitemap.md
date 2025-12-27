---
createdAt: "2023-04-23T03:08:00.000Z"
updatedAt: "2023-05-01T14:34:00.000Z"
summary: "Astro でサイトをリニューアルしたのでタイトルの通りサイトマップに対応する方法について書いておく。"
tags:
  - "Astro"
date: "2023-05-01"
draft: false
title: "Astro でサイトマップ"
---

## はじめに

Astro でサイトをリニューアルしたのでタイトルの通りサイトマップに対応する方法について書いておく。

## 結論

めちゃくちゃ簡単に実現できて、以下のコマンドでインテグレーションを追加するだけで良い。

```sh
$ npx astro add sitemap
```

上記コマンドを実行したら`astro.config.mjs` に以下が追記されているはず。（注意点として `site` プロパティは追記が必要）

```javascript title="astro.config.mjs" showLineNumbers
+ import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",
  integrations: [
+    sitemap()
  ]
});
```

ビルドしたら `sitemap-0.xml`, `sitemap-index.xml` が dist/ 配下に生成される。

## 1 つのファイルとしてサイトマップを出力したい場合

上記の公式インテグレーションを使用すると、2 つのファイルが生成される。 `sitemap.xml` だけを生成して欲しい場合は自分でカスタムインテグレーションとして実装する必要がある。

以下に参考になりそうな記事を見つけたので、興味がある人は参考にして欲しい。

https://shinobiworks.com/blog/641/

## 参考

https://docs.astro.build/ja/guides/integrations-guide/sitemap/
