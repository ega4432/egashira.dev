---
createdAt: "2023-12-27T09:02:00.000Z"
updatedAt: "2025-01-18T08:27:00.000Z"
summary: "今年も年の瀬が近づいて来たと言うことで一年を振り返ってみる。"
tags:
  - "Retrospective"
  - "Engineer"
  - "Career"
  - "2023"
  - "Recap"
date: "2023-12-31"
draft: false
title: "2023 年のふりかえり"
---

## はじめに

今年も年の瀬が近づいて来たと言うことで一年を振り返ってみる。今年は人生でかなり大きく変化があった年だったと思う。

昨年分はこちら。

[https://egashira.dev/blog/2022-recap](https://egashira.dev/blog/2022-recap)

## 技術的なあれこれ

### バックエンド

基本は Node.js(TS) をよく書いていた。あとは勉強として久々に Go を書いたりしてた。net/http パッケージだけで軽い API 作れるのはめっちゃいい。来年はもう少し深掘りながら Go を書きたい。

### フロントエンド

このサイトを Next.js から Astro に置き換えた。より素の HTML に近いというところが気に入って使っている。飽きたらまたリプレースするかもだけど、Astro はアップデートが速いので、新しい機能とか触ってみたら記事書いてみようと思う。

Next.js を個人開発で使っていてフルスタックなアプリケーションであれば今のところ Next.js が一番てっとり早く作れそう（デプロイまでのパイプラインがめっちゃ便利）な印象なので今後も使っていくことになりそう。

### DB

アセット開発で MongoDB を少し使ったときに [Mongoose](https://mongoosejs.com/) という ORM(?) を使ったけど型とかいい感じにできずにあまり良くなかった。TypeScript 使っているなら DB のモデルも型に落とし込め得ないと正直辛いという反省を得た。

個人では Vercel Postgres を使ってのアプリも作ってみたが無料であそこまで使えるのは非常に良かった。また今やっている個人開発で PlanetScale を使ってアプリの開発をしているので、引き続き MySQL は使いそう。

### インフラ

コンテナ周りでは、仕事で Docker/Kubernetes の新卒教育を担当させてもらった（多分来年もやることになりそう）。他人に教えるには、これまで以上に自分自身が噛み砕いて理解しておく必要があったためそれなりに勉強したり、準備したりした。その経験を通して自分自身も成長できたし非常に良い機会をいただけたなと思う。

個人で Terraform を結構触ってた。既存インフラのコード化やリファクタリングしてモジュール化していく作業を愚直に取り組んでいたが、ループで複数リソースを作ったり、どうモジュール化すると再利用し易いかなどを考えながらやっていくのは大変だったけど楽しかった。Terraform の記事はいくつか書いた。

### アウトプット

今年のアウトプットした技術記事をいくつか載せておく。

[https://egashira.dev/blog/k8s-taint-toleration](https://egashira.dev/blog/k8s-taint-toleration)

[https://egashira.dev/blog/how-to-set-env-into-nginx-container](https://egashira.dev/blog/how-to-set-env-into-nginx-container)

[https://egashira.dev/blog/created-my-own-github-action](https://egashira.dev/blog/created-my-own-github-action)

[https://egashira.dev/blog/uses-google-oauth-for-cloudflare-pages](https://egashira.dev/blog/uses-google-oauth-for-cloudflare-pages)

[https://egashira.dev/blog/configuring-htpasswd-identity-provider](https://egashira.dev/blog/configuring-htpasswd-identity-provider)

[https://egashira.dev/blog/terraform-github-provider](https://egashira.dev/blog/terraform-github-provider)

[https://egashira.dev/blog/free-rdb-services-2023](https://egashira.dev/blog/free-rdb-services-2023)

[https://egashira.dev/blog/playwright-github-actions-budget-notification-bot](https://egashira.dev/blog/playwright-github-actions-budget-notification-bot)

## プライベート

結婚したというのもありかなり大きな変化があった年だった。引っ越しやら、前撮り、結婚式と全部をこの一年に詰め込んだので毎週土日は何かしらの予定が入っていてかなり慌ただしかった。ただ人生で初めての経験がこの年になっていくつもできたし、一つ一つを楽しむことができた。

お互いの仕事が忙しくハネムーンに行けてないので、来年どこかで長めの休みを取って遊びに行けたらいいなと思っている。おすすめの旅行先あれば教えてください w

## その他

### トレーニング

いわゆるウエイトトレーニングをちゃんと初めてから半年くらい経った。それくらい続けていると体も数字も伸びてきて成長を感じられている。これまで記録など取らず雰囲気でやってきていて年末くらいからアプリ[^1]で記録を取ったりメニューを決めたりし始めたので、来年もそれを継続して頑張りたい。

週に 2 回くらいは走るメニューも組み込んでいるけど体脂肪率を下げるためにももう少し頻度を増やしたほうがいいかなと思いつつも外が寒いのでなかなか実現できていない。

### 英語学習

今年前半は割りと頑張っていて CEFR 基準で B1 という結果まで上げることができた。TOEIC L&R は 745 と過去最高記録を出すことができたし、英会話もいくつかのサービスを試して自分に合うスタイルを模索し 1, 2 ヶ月くらいは続けられた（B1 超えて辞めっちゃった）。

今継続しているのは Duolingo くらいだが、来年も Duolingo だけは継続して頑張ろうと思う。

### 買ってよかったもの

- [FlexiSpot E7 Pro](https://www.flexispot.jp/e7-pro.html)
  - 引っ越しに伴って念願だった電動昇降デスク。有名所の FlexiSpot の新春セールでちょっと安く買えた。1 日に 2 時間くらいは立って作業していると思う。めちゃくちゃ満足している。
- [IKEA Billy 本棚](https://www.ikea.com/jp/ja/p/billy-bookcase-white-30522041/)
  - 前から本棚を欲しいと思っていたが新居のスペースにピッタリのものを見つけたので購入。縦長でデッドスペースに置けてかなりいい感じ。
- [iPad 第 10 世代](https://www.apple.com/jp/ipad-10.9/)
  - そんなに欲しかったわけじゃないけど、タブレットあると便利だよねということで購入。本を読んだり、読書したりに、システム構成考える際のお絵描きなど使っている。Apple Pencil とキーボードと付属品も一緒に買っていい感じに使えてる。

## まとめ

今年もいろんな経験ができて本当に充実した年だった。

来年は少しゆっくりしつつも楽しんで過ごせたらと思う。

[^1]: BURN.FIT というアプリを使っている。筋トレ記録系のアプリいくつか試したがこれが機能的に一番自分にあっていそうだったのでこれに落ち着いた。
