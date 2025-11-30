---
createdAt: "2023-03-26T11:25:00.000Z"
updatedAt: "2023-04-08T09:20:00.000Z"
summary: "このサイトを Vercel から Cloudflare Pages へ移行した際にプレビュー画面へ Google 認証を設定した。その方法についてまとめる。"
tags:
  - "Cloudflare"
  - "Security"
  - "Google"
  - "OAuth"
date: "2023-04-02"
draft: false
title: "Cloudflare Pages でプレビュー画面に Google 認証を設定する"
---

## はじめに

このサイトを Vercel から Cloudflare Pages へ移行した。その際にプレビュー画面へ Google 認証を設定したので、その方法についてまとめておく。

以下に記載する手順については Cloudflare Pages を使って静的サイトをホスティングする場合にはおそらく同じ流れになると思う。

## Google Cloud Console で OAuth 同意画面の設定

まず OAuth クライアントを作成する前に OAuth 同意画面の設定をする必要がある。以下の手順に従って設定する。

1. Google Cloud Console にログインし、左側のメニューから「API とサービス」>「OAuth 同意画面」を選択します。
2. 「アプリケーションに必要な設定を行う」を選択し、「アプリケーション名」、「ユーザーサポートメール」など任意の値を入力し、ユーザーの種類は「外部」を選択し、「次へ」をクリックする。
3. 「スコープの追加」をクリックし、`.../auth/userinfo.email` を追加し「更新」をクリックする。
4. 以降は、適宜必要な情報を入力し「保存して次へ」で進めていき、完了すればダッシュボードに戻る。

## **Google API Console で認証情報を作成**

次に Google Cloud Console で OAuth クライアント ID を作成する必要がある。以下の手順に従って認証情報を作成する。

1. 「API とサービス」から「認証情報」を選択し、「認証情報を作成」をクリック。
2. 「OAuth クライアント ID」を選択し、「Web アプリケーション」を選択。
3. 「承認済みの JavaScript 生成元」には `https://example-dev-pages.cloudflareaccess.com`を入力する。
4. 「承認済みのリダイレクト URI」には `https://example.pages.dev/cdn-cgi/access/callback` を入力する。
5. 「作成」をクリックして OAuth クライアント ID を作成します。
   1. ここで OAuth のクライアント ID とクライアントシークレットが表示されるのでメモしておく。

## **Cloudflare Zero Trust で Identity Provider を追加する**

Cloudflare Pages へのアクセス制御は Cloudflare Zero Trust というサービスを使用する。

1. Cloudflare Zero Trust の「**Settings**」より「**Login methods**」の「Add new」より Google を追加する。
2. App ID、Client Secret に先程 Google Cloud Console で取得したクライアント ID、クライアントシークレットをペーストする。

## **Cloudflare Pages 用の Policy を作成する**

ここまでで Google 認証は実現できた。最後に、プレビュー画面は自分しかアクセスしないため特定の Google アカウントのみがアクセスできるよう Policy を設定する。

1. Cloudflare Zero Trust のメニューから「Access」>「Application」と進む。
2. 設定したい Cloudflare Pages のプロジェクトのレコードの 3 点リーダ `…` から「Configure」をクリックする。
3. 「Add Policy」をクリックし、「Type」を `include`、「Selector」を `Emails`、「Value」を自身のメールアドレスと入力して保存する。
4. 作成した Policy の対象を設定する。「Subdomain」を `*`、「Domain」を `例） example.pages.dev` として設定を保存する。

以上で、Cloudflare Pages のプレビュー画面に Google 認証で自分だけがアクセスできる設定が完了となる。

## あとがき

この記事はほとんど ChatGPT に書いてもらった。ベースは書いてもらって、自分が作業した部分と異なる内容を修正するだけで済んだのでこういう記事を書くハードルがだいぶ下がった気がする。

## 参考

[https://developers.cloudflare.com/cloudflare-one/policies/access/#actions](https://developers.cloudflare.com/cloudflare-one/policies/access/#actions)

[https://dev.classmethod.jp/articles/use-google-account-for-cloudflare-access-authentication/](https://dev.classmethod.jp/articles/use-google-account-for-cloudflare-access-authentication/)

[https://swfz.hatenablog.com/entry/2022/09/30/193552](https://swfz.hatenablog.com/entry/2022/09/30/193552)
