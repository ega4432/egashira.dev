---
title: "Astro 製のサイトに Mermaid 記法を導入する"
date: "2025-04-29"
tags: ["Astro", "Markdown", "Mermaid", "Update"]
draft: false
summary: "Astro 製のこのサイトに Mermaid 記法を導入してみたので手順をまとめてみた"
---

## はじめに

ブログを書く際に、ちょっとしたフロー図やシーケンス図で表現したい場合がある。その際に Mermaid が使えると便利だなと思ったので Astro 製のこのサイトで対応してみたのでその方法を残しておく。

ちなみに Astro v5.5 から markdown の設定に `excludeLangs` を設定できるようになったので実装が簡単になった。

https://astro.build/blog/astro-550/

Astro v5 にアップグレードする方法については下記のエントリを参照。

https://egashira.dev/blog/upgrade-astro-v5

## 実装手順

実装はとても簡単で下記の 2 step で実現できる。

### パッケージのインストール

Mermaid への変換は rehype プラグインを使うため、それをインストールする。

```sh
$ npm i rehype-mermaid
```

### astro.config.mjs に設定を追加

パッケージがインストールできたら Astro の config ファイルに設定を追加していく。

<!-- prettier-ignore -->
```js title="astro.config.mjs" showLineNumbers
import rehypeMermaid from "rehype-mermaid"; // [!code ++]

export default defineConfig({
  // ... 省略
  markdown: {
    syntaxHighlight: {
      type: "prism",
      excludeLangs: ["mermaid"] // [!code ++]
    },
    rehypePlugins: [
      rehypeSlug,
      [ // [!code ++]
        rehypeMermaid, // [!code ++]
        { // [!code ++]
          strategy: "img-svg", // [!code ++]
          dark: { // [!code ++]
            theme: "dark", // [!code ++]
            fontFamily: "sans-serif" // [!code ++]
          } // [!code ++]
        } // [!code ++]
      ] // [!code ++]
    ]
  }
  // ... 省略
});
```

- `markdown.syntaxHighlight.excludeLangs`
  - `markdown.syntaxHighlight.type` で指定されたデフォルトの構文ハイライトから除外する言語を配列で指定する。Mermaid のような、コードブロックからダイアグラムを作成するツールを使用する際に指定する。
- `markdown.rehypePlugins`
  - Markdown の出力 HTML の処理方法をカスタマイズするために rehype プラグインを渡す。プラグイン関数をインポートして適用するし、オプションを一緒に渡したい場合は全体を配列として括ってあげれば良い。
  - オプションについての各設定項目については後述。

### rehype-mermaid のオプションの各項目の詳細な設定について

コード例の中で使われている rehype-mermaid のオプションについて、それぞれの役割と設定理由を説明する。

#### strategy: "img-svg"

このオプションは Mermaid ダイアグラムのレンダリング方法を指定する。

`img-svg` は図をインラインの base64 SVG 画像としてレンダリングする。
デフォルトでは `inline-svg`となるが、`dark` オプションを使用するにはこの `img-svg` か `img-png` にする必要がある。`img-png` と比較すると SVG はファイルサイズが小さくなるためこちらを採用した。

#### dark オプション

このオプションはダークモード表示時の Mermaid ダイアグラムの見た目を設定する。

このサイトようにサイトにダークモード機能がある場合、ダイアグラムもそれに合わせて表示を切り替えたいと思うはずだ。
`theme: "dark"` とすることで Mermaid が提供するダークテーマを指定でき、暗い背景に適したコントラストの色設定が適用される。

## 結果

こちらに追記した。

http://egashira.dev/blog/dummy-entry#mermaid-記法

## まとめ

Astro v5 から簡単に Mermaid 記法を導入することができるようになっていた！

今後ダイアグラムで表現したい場合には、どんどん活用していこうと思う。Astro でサイトを作っていて Mermaid 記法を導入したい方は是非参考してもらえれば。

## 参考

https://docs.astro.build/ja/guides/markdown-content/

https://mermaid.js.org

https://zenn.dev/wagomu/articles/20250315_astro_mermaid

https://nova.drifting-clouds.com/ja/blog/mermaid-drawing-with-mdx
