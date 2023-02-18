---
title: Next.js と MDX でリンクカードを実装する
date: "2023-01-14"
tags: ["Next.js", "Markdown", "MDX", "React", "Update"]
draft: false
summary: "ずっとやりたいなと思っていたので年始の暇な時間でやってみた"
---

## はじめに

Qiita や Zenn を始め巷のブログサービスには Markdown に貼った際、リンクをカード形式で表示するリンクカードなるものに対応されている。このサイトでもそれを実装してみたので手順などについて簡単にまとめる。

## デモ

このサイトは Markdown ファイルでブログ記事を書いている。以下のように URL のみの行を書くとリンクカード形式で表示される。

```md:some-article.md showLineNumbers
https://github.com/ega4432

https://zenn.dev/ysmtegsr/articles/bd9b5935f40d73f80d8a
```

https://github.com/ega4432

https://zenn.dev/ysmtegsr/articles/bd9b5935f40d73f80d8a

## unified について

こちらの記事が理解の参考になったので、unified 周辺の言葉の定義が曖昧な場合は先にこちらを読んでいただくほう早いかもしれない。

https://zenn.dev/januswel/articles/e4f979b875298e372070

## 実装手順

### 使用したライブラリ

使用している技術は以下である。

- フレームワーク
  - React/Next.js
- MDX ライブラリ
  - mdx-bundler

選定した理由としては、まず前提としてこのサイトは以下のリポジトリを fork しているものになっている。

https://github.com/timlrx/tailwind-nextjs-starter-blog

そのため MDX をバンドルするライブラリはこちらで使用されている mdx-bundler をそのまま使用した。

https://github.com/kentcdodds/mdx-bundler

### プラグインを実装する

リンクだけのパラグラフをリンクカードに変換する unified プラグインを実装する。かなり長いので一旦全体を貼り付けつつ、ポイントだけを後で解説する。

```ts:lib/remark-link-card.ts showLineNumbers
import { Parent, Position } from 'unist'
import { visit } from 'unist-util-visit'
import getMetadata from 'metadata-scraper'

const URL_REGEXP =
  /^https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+$/g
const MY_HOST = 'egashira.dev'

type LinkNode = Parent & {
  children: { type: string; value: string; position: Position }[]
  url: string
  title: string | null
}

type Meta = {
  url: string
  title: string
  description: string
  image: string
  icon: string
}

type JsxElement = {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement'
  name: string
  attributes: JsxAttribute[]
  children: (JsxElement | TextElement)[]
}

type TextElement = {
  type: 'text'
  value: string
}

type JsxAttribute = {
  type: 'mdxJsxAttribute'
  name: string
  value: string
}

const remarkCardLinks = () => {
  return async (tree: Parent) => {
    const promises: (() => Promise<void>) = []

    const visitor = (node: Parent) => {
      const linkNode = node.children.find((n) => n.type === 'link') as LinkNode
      const url = linkNode.url

      promises.push(async () => {
        const meta = await fetchMeta(url)
        if (!meta) {
          return
        }

        const domain = new URL(url)
        const isExternal = domain.hostname !== MY_HOST
        const main = {
          type: 'mdxJsxFlowElement',
          name: 'div',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'className', value: 'remark-link-card-main' }
          ],
          children: [
            {
              type: 'mdxJsxTextElement',
              name: 'div',
              attributes: [
                { type: 'mdxJsxAttribute', name: 'className', value: 'remark-link-card-title' }
              ],
              children: [{ type: 'text', value: meta.title }]
            }
          ]
        } as JsxElement

        if (meta.description) {
          main.children.push({
            type: 'mdxJsxTextElement',
            name: 'div',
            attributes: [
              { type: 'mdxJsxAttribute', name: 'className', value: 'remark-link-card-description' }
            ],
            children: [{ type: 'text', value: meta.description }]
          })
        }

        if (meta.icon) {
          main.children.push({
            type: 'mdxJsxFlowElement',
            name: 'div',
            attributes: [
              {
                type: 'mdxJsxAttribute',
                name: 'className',
                value: 'remark-link-card-origin'
              }
            ],
            children: [
              {
                type: 'mdxJsxFlowElement',
                name: 'img',
                attributes: [
                  { type: 'mdxJsxAttribute', name: 'alt', value: url },
                  { type: 'mdxJsxAttribute', name: 'src', value: meta.icon }
                ],
                children: []
              },
              {
                type: 'mdxJsxTextElement',
                name: 'div',
                attributes: [
                  { type: 'mdxJsxAttribute', name: 'className', value: 'remark-link-card-domain' }
                ],
                children: [{ type: 'text', value: domain.hostname }]
              }
            ]
          })
        }

        const image = {
          type: 'mdxJsxFlowElement',
          name: 'div',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'className', value: 'remark-link-card-image' }
          ],
          children: []
        } as JsxElement

        const linkCardNode = {
          type: 'mdxJsxFlowElement',
          name: 'a',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'className', value: 'remark-link-card-wrapper' },
            { type: 'mdxJsxAttribute', name: 'href', value: isExternal ? url : domain.pathname }
          ],
          children: [main, image]
        } as JsxElement

        if (isExternal) {
          linkCardNode.attributes.push({ type: 'mdxJsxAttribute', name: 'target', value: '_blank' })
        }

        if (meta.image) {
          (linkCardNode.children[1] as JsxElement).children.push({
            type: 'mdxJsxFlowElement',
            name: 'img',
            attributes: [
              { type: 'mdxJsxAttribute', name: 'alt', value: meta.url },
              { type: 'mdxJsxAttribute', name: 'src', value: meta.image }
            ],
            children: []
          })
        }

        node.type = 'LinkCard'
        node.children = [linkCardNode]
      })
    }

    visit(tree, isLink, visitor)
    await Promise.all(promises.map((t) => t()))
  }
}

const isLink = (node: Parent): node is Parent =>
  node.type === 'paragraph' &&
  node.children &&
  node.children.length === 1 &&
  node.children[0].type === 'link' &&
  (node.children[0] as LinkNode).children[0].value.match(URL_REGEXP) !== null

const fetchMeta = async (url: string): Promise<Meta | null> => {
  return await getMetadata(url)
    .then((meta) => {
      return {
        url,
        title: meta.title || '',
        description: meta.description || '',
        image: meta.image || '',
        icon: meta.icon || ''
      }
    })
    .catch((e) => {
      console.error(e)
      return null
    })
}

export default remarkCardLinks
```

まずプラグインの肝は以下の部分で第一引数にノードすなわち MDAST(Markdown AST)を受け取り、第二引数にこのプラグインで処理したいノードの条件を、第三引数で実際に処理内容を書く。

```ts showLineNumbers
const remarkCardLinks = () => {
  visit(tree, isLink, visitor);
};
```

ただ、通常ならこれでいいが、今回のように HTTP 通信などが必要な場合は非同期処理が必要にある。しかし、visitor を async/await で書くことは現状できなかったためこの issue を参考に以下のようにした。

https://github.com/syntax-tree/unist-util-visit-parents/issues/8

```ts showLineNumbers {2,4-7,10}
const remarkCardLinks = () => {
  const promises: (() => Promise<void>)[] = [];
  const visitor = () => {
    promises.push(async () => {
      // 非同期処理
      // ex: await axios.get('https://api.example.com')
    });
  };
  visit(tree, isLink, visitor);
  await Promise.all(promises.map((t) => t()));
};
```

次に `mdxJsxFlowElement`, `mdxJsxTextElement` みたいなものが出てきているのは何かと思われるかもしれない。これは mdast-util-mdx-jsx という MDX 中の JSX タグをパースするもので `mdxJsxFlowElement` だとブロック要素、`mdxJsxTextElement` だとインライン要素に変換される。

https://github.com/syntax-tree/mdast-util-mdx-jsx

```showLineNumbers
{
  type: "mdxJsxFlowElement",
  name: "div",
  attributes: [{ type: "mdxJsxAttribute", name: "className", value: "contents" }],
  children: [{ type: "text", value: "This is contents!" }]
}
```

上のようなものは以下の HTML へとパースされる。

```html showLineNumbers
<div class="contents">This is contents!</div>
```

サイトのメタデータの取得には metadata-scraper というライブラリを使用した。

```ts showLineNumbers
import getMetadata from "metadata-scraper";

const fetchMeta = async (url: string): Promise<Meta | null> => {
  return await getMetadata(url);
};
```

https://github.com/BetaHuhn/metadata-scraper

### プラグインを mdx-bundler に適用する

実装したプラグインを mdx-bundler に読み込ませる。

```ts:lib/mdx.ts showLineNumbers {7}
const { code, frontmatter } = await bundleMDX({
    source,
    cwd: path.join(process.cwd(), 'components'),
    xdmOptions(options, frontmatter) {
        options.remarkPlugins = {
            ...(options.remarkPlugins ?? []),
           remarkCardLinks
        }
    }
})
```

## 今後の課題

今回は対応しなかったが、いずれやりたいこと。

- Twitter URL によるツイートを埋め込み
- GitHub, gist URL によるソースコードの表示およ行指定対応
  プレゼンテーションサービスのリンクへの対応（SlideShare, SpeakerDeck, etc ...）
- OGP 画像のレスポンシブ対応（現状スマホの場合見切れる場合がある）

## まとめ

自分が選定していないライブラリで実装するのは結構骨の折れる作業だった。トレードオフなのでなんとも言えないが、テンプレートリポジトリやスターターキットを使うとこういうカスタマイズに柔軟に対応できないデメリットがあると感じた。

## 参考

https://www.haxibami.net/blog/posts/blog-renewal#%E3%83%AA%E3%83%B3%E3%82%AF%E3%82%AB%E3%83%BC%E3%83%89

https://qiita.com/sankentou/items/f8eadb5722f3b39bbbf8

https://qiita.com/masato_makino/items/ef35e6687a71ded7b35a

https://github.com/zenn-dev/zenn-editor/tree/canary/packages/zenn-markdown-html

https://github.com/kentcdodds/mdx-bundler
