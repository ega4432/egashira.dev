---
title: "Next.js のサイトに Google Tag Manager 経由でGoogle Analytics(GA4)を導入する"
date: "2022-03-28"
tags:
  ["Next.js", "Google Analytics", "Google Tag Manager", "TypeScript", "Update"]
draft: false
summary: "このサイトのアクセス解析のため Google Analytics を導入した際のメモ"
---

## はじめに

このサイトのアクセス解析をするために Google Analytics を設置した。他にも同等な記事は検索するとよく見つかるが、下記の課題があった。

- 直接 Google Analytics を使うのか、Google Tag Manager 経由で Google Analytics を使うのか
- GA4, UA どちらを使っているか

というのがパット見で分かりづらかった。そういう経緯もありタイトルが長くなってしまった。
また、今回は Next.js v12 , TypeScript 環境下で動作させている。

## TL;DR

この通りにやったらほぼできた。（[@keita](https://twitter.com/keita_kn_web) さんに感謝）

[Next\.js で GTM \+ GA4 を利用する](https://zenn.dev/keitakn/articles/nextjs-google-tag-manager)

途中に出てくるコードもかなり参考にさせていただいたことも、先に述べておく。

また Next.js に慣れていないと言うこともあり Google Tag Manager を設置する過程で勉強になったことも挟んでいきたい。

## Google Analytics 側の作業

事前に Google Analytics でアカウントを作成し、`G-` から始まる測定 ID を取得しておく必要がある。下記の手順で測定 ID を取得できる。

1. [アナリティクスホーム](https://analytics.google.com) からアカウントを作成

![アカウント作成](https://i.imgur.com/wlC29rd.webp)

2. プロパティを作成

![プロパティ作成](https://i.imgur.com/iR0X7Oz.webp)

3. データストリームを設定

プラットフォームに「ウェブ」を選択し、任意のウェブサイトの URL を入力する。

![データストリームを設定](https://i.imgur.com/e370tbv.webp)

## Google Tag Manager 側の作業

1. [タグマネージャーホーム](https://tagmanager.google.com/#/home) よりアカウントの作成

コンテナ設定では　 Google Analytics 同様にウェブを選択し、 URL を入力する。

![アカウント作成](https://i.imgur.com/biklCsO.webp)

2. 「新しくタグを追加」より「Google アナリティクス: GA4 設定」を選択

![GA4 用タグ追加](https://i.imgur.com/Nghrg14.webp)

3. 取得した Google Analytics の測定 ID を入力

![測定 ID 取得](https://i.imgur.com/5CAF6x8.webp)

ここまでできれば事前準備は完了なので、後はコードを書いていく。

## Google Tag Manager コンポーネントの作成

まずは Google Tag Manager の Script を埋め込むためのコンポーネント作成する。

```ts:components/GoogleTagManager.tsx showLineNumbers
import Script from 'next/script'
import { FC } from 'react'

export type GtmId = `GTM-${string}`

type Props = {
  gtmId: GtmId
}

const GoogleTagManager: FC<Props> = ({ gtmId }) => {
  return (
    <Script
      id="gtm"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');
        `
      }}
    />
  )
}

export default GoogleTagManager
```

## \_app.tsx で読み込み

Google Tag Manager を見ると、`このコードは、次のようにページの <head> 内のなるべく上のほうに貼り付けてください。` と書いてあるので、 てっきり \_document.tsx の `<Head>` の中に書くのかなと思っていたが、どうやら違うらしい。

公式ドキュメントを見ると分かる通り、`next/script` は \_app.tsx に書きなさいとのこと。

[script\-in\-document\-page \| Next\.js](https://nextjs.org/docs/messages/no-script-in-document-page)

```tsx:pages/_app.tsx {1-2, 7} showLineNumbers
import GoogleTagManager, { GtmId } from '@/components/GoogleTagManager'
import { gtmId } from '@/lib/utils/gtm'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <GoogleTagManager gtmId={gtmId as GtmId} />
      <LayoutWrapper>
        <Component {...pageProps} />
      </LayoutWrapper>
    </ThemeProvider>
  )
}
```

Google Tag Manager へ情報を渡す dataLayer を使えるように window interface を拡張する。

```ts:lib/utils/gtm.ts showLineNumbers
export const gtmId = process.env.NEXT_PUBLIC_GTM_ID || ''

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}
```

Google Tag Manager の ID は、`NEXT_PUBLIC_` プレフィックスを使用して、ビルド時に参照する。（プレフィックスなしの `process.env.HOGE_FUGA` はサーバーサイドでのみ参照できる）

```:.env showLineNumbers
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
```

## Google Tag Manager のデバッグ

ここまでできたら、ローカルサーバを起動して読み取りされる状態になっているか確認する。毎回この手のアクセス解析ツールのデバッグには苦労していたが、[Tag Assistant](https://tagassistant.google.com/) を使えば楽に検証できた。Google Tag Manager のワークスペース画面よりプレビューボタンを押すと起動できるようになっている。

正しくタグを読み取れるようになっていれば、下記みたいに GA4 が検出されるはずだ。

![プレビュー画面](https://i.imgur.com/vDtU46D.webp)

![GTM デバック画面](https://i.imgur.com/YpkFQlu.webp)

## まとめ

Next.js + TypeScript で作っているこのサイトに Google Tag Manger を導入した。これで管理画面からポチポチとやるだけで設定を変えることができるようになった。

## 参考

https://zenn.dev/keitakn/articles/nextjs-google-tag-manager

https://zenn.dev/waddy/scraps/940ac10e7c3f94

https://panda-program.com/posts/nextjs-google-analytics

https://zenn.dev/kcabo/scraps/9c4bfc65720554
