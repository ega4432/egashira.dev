---
title: "Cloudflare Pages の ビルドシステムを切り替える"
date: "2023-09-23"
tags:
  - Cloudflare
  - Cloudflare Pages
draft: false
summary: "2023 年 5 月にリリースされた v2 ビルドシステムに満を持して切り替えてみた"
---

## はじめに

以下の公式ページにある通りビルドシステムが v2 になっていたため、本サイトでもマイグレーションしてみた。

https://developers.cloudflare.com/pages/platform/language-support-and-tools/#v2-build-system

## 何が変わるか

### ランタイムのバージョン

まずは、言語のランタイムやパッケージマネージャのサポートするバージョンがアップデートされた。

本サイトは Astro で構築しているため関連するのは Node.js なので Node.js について言及すると、従来の v1 ではデフォルトバージョンが 12.18.0 で v2 では 18.16.1 となっている（現時点ですでに LTS より遅れているのは黙っておこう、、、）。

また、`.node-version`, `.nvmrc` などのバージョンを指定する際に使われるファイルを自動的に解釈してくれるようになったっぽい。

### マシンのバージョン

Cloudflare のビルド環境である gVisor コンテナのマシンが Ubuntu の v20 から v22 にアップデートされた。こちらもほぼ LTS と同等になったみたい。

## 変更方法

何が変わるか整理できたところで、実際にマイグレーションしてみる。

変更については Cloudflare のダッシュボードから GUI で変更できる。該当する Cloudflare Pages のトップから `Settings` > `Build & deployments` と進む。

![Cloudflare Pages Settings](https://i.imgur.com/hikZPJx.webp)

そして、下にスクロールすると、ビルドシステムを設定する項目がある。以下のスクリーンショットのように Production 用と Preview 用とそれぞれで設定ができるようになっている。

（検証している途中にスクリーンショットを撮ったため、Preview 環境のみ v2 となっている。）

![Build system version](https://i.imgur.com/j7frEBt.webp)

`Configure Preview build system` をクリックすると v1, v2 を選べるようになっていて、こちらから変更できる。

![Configure Preview build system](https://i.imgur.com/S0s6TuP.webp)

## 実際にやってみた

Preview 環境で挙動を見てみると、以下のようにビルド時の Node.js のバージョンが変わることを確認できた。

![](https://i.imgur.com/CNlrvmu.webp)

余談だが `.tool-versions` ファイルを判別するようになっており、それに記載のあるバージョンをインストールできていた。

## 参考

https://blog.cloudflare.com/moderizing-cloudflare-pages-builds-toolbox/

https://developers.cloudflare.com/pages/platform/language-support-and-tools/#v2-build-system
