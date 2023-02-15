---
title: 'vercel/og-image を使って動的 OGP に対応する'
date: '2022-04-02'
tags: ['Next.js', 'Vercel', 'Update']
draft: false
summary: 'このサイトに動的 OGP 対応した際のメモ'
---

## はじめに

Next.js 製のこのサイトに動的 OGP を実装した。それに伴い行ったことなどを残しておく。

## 方針

Vercel でホスティングしている Next.js 製サイトに動的 OGP を実装する方法についてはいくつかある。

- [vercel/og-image](https://github.com/vercel/og-image)
- [Playwrite](https://playwright.dev/)
- [canvas](https://www.npmjs.com/package/canvas)

上記のライブラリがググると上の方に出てくるじゃないだろうか。今回は中でも情報が多く、割と一般的（？）である `vercel/og-image` を使うことにした。

## `vercel/og-image` を fork してローカルで立ち上げる

細かい部分をカスタマイズすることになるので、先んじて下記のリポジトリを fork しておく。

https://github.com/vercel/og-image

README.md のデプロイボタンからワンクリックで Vercel へデプロイできるようになっているのだが、無料の Hobby Plan ではこのままだとデプロイできないので以下に修正する。

```json:vercel.json {2-3, 6} showLineNumbers
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["hnd1"],
  "functions": {
    "api/**": {
      "memory": 1024
    }
  },
  "rewrites": [
    { "source": "/(.+)", "destination": "/api" }
  ]
}
```

Vercel は AWS で作られているらしく、できればより読者が多い日本の AWS リージョンでホスティングしてほしいので、 `region` も修正してみた。気になる人は Vercel と AWS のリージョンの対応表[^1]を参照してみてほしい。

また、これから OGP 画像をカスタマイズしていく訳だが、ローカルで確認しながら修正していきたい。それには Vercel CLI を使うとローカルで Serverless Function を含んだコードを実行できるので非常に便利だ。導入は下記に書いたが、3 行コマンドを実行するだけで完了する。

```shell
# インストールがまだであればインストールする
$ npm install -g vercel

# 初回は Vercel アカウントと CLI の紐付けがされていないので認証を求められる
# コマンドを実行しているパスのプロジェクトが Vercel にデプロイされる
$ vercel

# ビルドを実行し、localhost でサーバを起動
$ vercel dev
```

## 日本語に対応させる

まずは、デフォルトだと日本語に対応していないので日本語対応させる。

```ts:api/_lib/template.ts showLineNumbers
function getCss(theme: string, fontSize: string) {
    // 省略
    return `
    @import url('https://fonts.googleapis.com/css?family=Noto+Sans+JP&display=swap');

    ..

    .heading {
        font-family: 'Noto Sans JP', sans-serif;
        ..
    }`;
}
```

上の例では、`Noto Sans JP` をインポートして、CSS を適用した。もし使いたいフォントがあれば同様に URL で指定してあげれば良いと思う。

ここまでで一旦デプロイすると下記のようになり、無事日本語が表示できるようになる。

![OGP 画像の日本語表示](https://i.imgur.com/jcu9b1l.webp)

## デザインを調整する

ここまでできたら HTML, CSS を修正して OGP のデザインを微調整するだけだ。僕は、技術ブログサービスで有名な Qiita, はてブ、Zenn あたりを参考に記事のタイトルとサイト名を OGP 画像に埋め込んだ。

![OGP 画像のデザイン](https://i.imgur.com/z18GTbL.webp)

SNS のタイムラインなどでシェアされた場合、ユーザに視覚的に訴えることができ、少しでもインプレッションの向上に寄与できれば嬉しい。

## OGP 画像として使いたいサイトで meta タグを変更する

最後に、実際に OGP 画像を使いたいこのサイトから使える用に meta タグを修正する。

このサイトは Next.js で作られていて、SEO に関する meta タグ類は SEO コンポーネントにまとめている。

```tsx:components/SEO.tsx showLineNumbers
interface SEOProps {
  title: string
  description: string
  ogType: string
  ogImage: string
  twImage: string
}

const SEO = ({
  title,
  description,
  ogType,
  ogImage,
  twImage
}: SEOProps) => {
  if (ogType === 'article') {
    const dynamicOgImage = `${process.env.NEXT_PUBLIC_OG_IMAGE_DOMAIN}/${encodeURIComponent(title)}`
    ogImage = dynamicOgImage
    twImage = dynamicOgImage
  }
  return (
    <Head>
      <title>{title}</title>
      {/* OGP 以外の meta タグは省略 */}
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} key={ogImage} />
      <meta name="twitter:image" content={twImage} />
      <meta name="twitter:card" content='summary_large_image' />
    </Head>
  )
}
```

コメントアウトにも書いている通り OGP 以外の meta タグを省略して書くと上記のようになる。

ブログ記事の `pages/blog/[...slug].tsx` からこのコンポーネントを呼び出す際にだけ props `ogType='article'` を渡して上げれば良い。また、`NEXT_PUBLIC_OG_IMAGE_DOMAIN` には `vercel/og-image` から fork してデプロイした URL を .env に設定しておけば OK だ。

## まとめ

今回は Next.js で作られたこのサイトに動的 OGP を実装してみた。

Vercel についてよく知らなかったけど、内部的に AWS が使われていたり、CLI が便利だったりといろいろと学びがあった。また動的な OGP 画像の作り方もたくさんのブログ記事を読む過程でかなり勉強になった。

今後もし、取り組むとしたら AWS Lambda などを使って一から同様の仕組みを作ってみたい。

## 参考

https://zenn.dev/tdkn/articles/c52a0cc7bea561

https://applis.io/posts/nextjs-generate-image-from-html

https://vercel.com/docs/concepts/edge-network/regions

https://qiita.com/takaken/items/530d19a549a730c15fcd

[^1]: [Regions – Vercel Docs](https://vercel.com/docs/concepts/edge-network/regions)
