---
title: 2022 年の振り返り
date: "2022-12-31"
tags: ["Engineer", "Career", "Retrospective"]
draft: false
summary: 2022 年 1 年間のやってきたことを振り返ってみた
---

## はじめに

2022 年 1 年間のやってきたことを振り返ってみた。大きく仕事とプライベートで分けているが仕事のプロジェクトの詳細についてはあまり公にできないのでその分ボリュームも少ない。

## 仕事

2022 年は丸 1 年今の会社に入って働いた。長い研修も 2021 年に無事終わらせることができたので割と仕事に集中できた。いろんなお客様のプロジェクトに入って活動ができたし、初めての技術にも触れながら成長できた気がする。

### 技術的なあれこれ

前提として実際のプロジェクトの内容は書けないので、技術的なことにフォーカスして言及する。

- バックエンド、フロントエンド開発
  - 共に JavaScript/TypeScript を書くことが多かった。[npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) という仕組みを使ってモノレポで開発するパターンが多かった。
  - フロントエンドには React を採用するのがほとんどだった。というか全部かもしれない。毎回凝ったものを作る訳ではないので、有名どころの UI フレームワークを使ってサクッと画面を作ることが多かった。
- インフラ構築
  - クラウドの IaaS サービスにコマンド叩いて構築作業、導入作業を行ったり、Terraform や Ansible を使って運用効率を考えてコード化したりにチャレンジした。
- コンテナ関連
  - Docker イメージから秘匿情報を抜き取ってみたり、Kubernetes の各種設定などを使ってみたりしてよりセキュアな構築・運用方法を学んだ。Helm や Trivy などのツールにも触れた。
  - Kubernetes の資格を CKA/CKAD と 2 つ取った。来年は CKS を取りたいと思っている。
- アーキテクチャ設計
  - 弊社で定義されているアーキテクチャの考え方や手法を学んだ。
  - コードを書くだけの仕事は少なくなり、大規模プロジェクトのアーキテクチャを設計したり、いろんな部署の人たちを巻き込みながら進めていくことが増えてきたと思う。

## プライベート

### ブログ執筆

記事は、本ブログと [Zenn](https://zenn.dev/ysmtegsr) へ投稿した。2022 年の 1 年間で計 40 記事を書いた。週に 1 本書くのが目標だったので、少しばかり足りなかった。来年も内容はライトなものでもいいので、頻度高く何かしら残していこうと思う。

### 作ったもの

いくつか作ったものがあるので掲載する。

- [ega4432/rss\-feed: A command line tool that allows you to retrieve feeds in JSON format\.](https://github.com/ega4432/rss-feed)
  - Go で RSS フィードを JSON にパースする CLI を作った。
- [ega4432/go\-lambda\-twitter](https://github.com/ega4432/go-lambda-twitter)
  - Go で Twitter クライアントを書いた。SAM で AWS 上に Lambda, API Gateway を作って、更に GitHub Actions で CI/CD パイプラインを整備した。
- [ega4432/tweet\-current\-page: The simple chrome extension that allows you to tweet the site you are currently viewing\.](https://github.com/ega4432/tweet-current-page)
  - 2021 年に作った Chrome 拡張のメンテと Google Market Place へのデプロイの仕組みを同様に GitHub Actions で作った。
- [ega4432/dotfiles: @ega4432 's dotfiles](https://github.com/ega4432/dotfiles)

  - いわゆる dotfiles を作った。macOS, Ubuntu に対応させて、GitHub Actions で週一でインストール処理を回すようにした。

### 読書

あまり多くの本を読めなかった。技術的なもの（ビジネス書、漫画を除く）は以下を読んだ。良書ばかりだったので興味のある方にはどれもオススメできる。

- [Go 言語 ハンズオン \| 掌田津耶乃 \|本 \| 通販 \| Amazon](https://amzn.to/427Tmg7)
- [ホワイトハッカーの教科書 \| IPUSIRON \| 工学 \| Kindle ストア \| Amazon](https://amzn.to/41Se9pa)
  - 感想ブログ：[「ホワイトハッカーの教科書」を読んだ](https://egashira.dev/blog/book-review/textbook-for-becoming-a-white-hacker)
- [O'Reilly Japan \- Kubernetes で実践するクラウドネイティブ DevOps](https://amzn.to/443TfVy)
  - 感想ブログ：[「Kubernetes で実践するクラウドネイティブ DevOps」を読んだ](https://egashira.dev/blog/book-review/cloud-native-devops-in-practice-with-k8s)
- [図解入門 TCP/IP 仕組み・動作が見てわかる \| みやた ひろし \|本 \| 通販 \| Amazon](https://amzn.to/4cb4u0m)

### 英語

てんでダメな英語にもそろそろ向き合わないといけないなと 2022 年の後半くらいに思い始めた。まずは、継続することを優先して以下をゆるく始めた。書いたり、話したりアウトプットできる英語力まで早く持っていきたい。

- Duolingo
  - 毎日 5 分くらいだけやっている。やっている人がいたら是非友達になってほしい。
  - プロフィールリンク：[Duolingo \- 世界 No\.1 の英語学習法](https://www.duolingo.com/profile/ega4432?via=share_profile)
- TOEIC L&R
  - [abceed](https://app.abceed.com/) というサービスでここ 2, 3 ヶ月間 30 分/日くらいのペースでゆるく学習している。
  - 学習内容は単語、文法、リスニングに一旦フォーカスしつつ、年明けの試験で 700 点台に乗れるよう頑張りたい。

## まとめ

2022 年を振り返ってみた。公私共にいろんなチャネルで活動できたと思う。今年以上に来年もこのサイトにアウトプットしていくつもりなので、是非読みに来ていただける大変嬉しく思う。
