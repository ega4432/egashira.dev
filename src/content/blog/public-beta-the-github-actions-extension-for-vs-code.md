---
createdAt: "2023-04-01T04:02:00.000Z"
updatedAt: "2023-04-01T07:34:00.000Z"
summary: "beta リリースされたので早速インストールして使ってみた"
tags:
  - "GitHub Actions"
  - "GitHub"
  - "CI/CD"
date: "2023-04-01"
draft: false
title: "GitHub Actions VSCode 拡張の紹介"
---

## はじめに

3/29 に public beta となったため、VSCode に早速インストールして使ってみた。今回は試してみたことをメモがてら残しておく。公式のブログは以下を参照してもらえればと思う。

[https://github.blog/2023-03-28-announcing-the-github-actions-extension-for-vs-code/](https://github.blog/2023-03-28-announcing-the-github-actions-extension-for-vs-code/)

## ワークフローの管理

VSCode 拡張を入れて、左側の GitHub Actions のアイコンをクリックすると、まずワークフローの一覧が確認できる。`.github/workflows/*.yaml` のファイルごとにまとめられているので見たいファイルのものを選択して広げて詳細を確認できる。

![](https://i.imgur.com/lp5OH1j.webp)

さらに `#130` などの部分のアクション id をクリックするとブラウザで action の画面を開き、`build` などの job 名をクリックすると、VSCode 上でアクションのログを確認できる。

![](https://i.imgur.com/n3eN86v.webp)

このあたりは、ブラウザと VSCode を行ったり来たりしていたのが少し楽になりそう。

## secret の確認と変更

ワークフローの一覧の下には、以下のように secret の一覧が表示されている（値はもちろん確認できない）。GitHub 上でこれまで確認や変更（削除含め）行っていたのが、VSCode 上でも可能となっていた。

![](https://i.imgur.com/RySr5gn.webp)

## 公開されている action へのリンク

`uses: actions/checkout@v3` など公開されている action を使用している箇所にホバーした際、GitHub リポジトリへのリンクが表示されるようになった！個人的にこれは非常にありがたくて、input の項目を確認する際いつも Google で検索していた手間がなくなったのは嬉しい。

![](https://i.imgur.com/Bgosf3p.webp)

## シンタックスハイライト

GitHub Actions の expression にシンタックスハイライトが適用されるようになった。また、ホバーすることでドキュメントへのリンクも対応されている。

それだけでなく、補完機能と構文チェックも実装されている。（[ツイートを参照](https://twitter.com/ega4432/status/1641995557043589120)）

![](https://i.imgur.com/V6gGDon.webp)

## 参考

[https://www.publickey1.jp/blog/23/github_actions_extension_for_vs_codevscode.html](https://www.publickey1.jp/blog/23/github_actions_extension_for_vs_codevscode.html)
