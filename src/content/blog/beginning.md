---
title: "個人サイト立ち上げ"
date: "2022-03-27"
tags: ["Next.js", "TailwindCSS", "TypeScript", "Vercel", "Google Domains"]
draft: false
summary: "このサイトの立ち上げを通して考えたことや学んだことなど"
---

## きっかけ

タイトルの通り新しく個人サイトを立ち上げた。ノリで作り始めた訳だが、作っているうちにいろんなことを考えながら作ったので、それを残しておきたく第一号のエントリにした（テストを除き）。

立ち上げるに至る理由としては、インターネット上に自分のドメインを持って運用してみたくなったからだ。

## ドメイン取得

このドメインにした経緯としては他人から見て覚えやすく、自分を一言で表すドメインであること、数年運用することになっても痛くない価格帯であることを重視した。

また以前から個人で Web サイトを運営しているエンジニアの方たちの中で `.me` や `.dev` などの割と新しめの TLD を使っている人たちを見ていていいなと思っていたので真似してみた。

各 SNS などのアカウント名として使っている `ega4432` のように数字が入ってしまうと見栄えも悪いし、覚えにくいと思ったので英字だけのドメインにした。（AWS Route53 では `.dev` ドメインが対応していないのを調べていて初めて知った[^1]）

取得した時点で対応していたのは Google Domains、お名前ドットコム、 Gandi くらい（他にもあるかも）だったので迷わず Google Domains で登録することにした。

## Next.js + TypeScript + Tailwind CSS

Next.js を使った理由としては、単純に最近流行りなものに手を出してみたかったというだけだ。仕事ではプレーンな React や Vue.js, Nuxt.js の経験もあり、以前のブログでは GatsbyJS を使ったこともあったので最近盛り上がりを感じていた Next.js を選択した。

僕はデザインやマークアップが苦手なので、「Next.js template」とか「Next.js stater」などで検索すると、雛形を提供してくれているものが多く見つかった。

https://github.com/timlrx/tailwind-nextjs-starter-blog

そこで上記の starter を見つけた。パット見だと JS を使用しているのだが、community support として [typescript branch](https://github.com/timlrx/tailwind-nextjs-starter-blog/tree/typescript) があったのでそれを使用した。

## ホスティング先

プライベートなので何も成約がないかつ、静的な Web サイトだと近日は逆に選択肢が多く、どこでホスティングするかをかなり迷った。

結論から言うと Vercel でいこうかと決めた。最初はロックインされたくなく調べたが、[Next\.js と外部 API で作成した静的サイトをデプロイしようとしたら、画像最適化を考えて結局 Vercel にデプロイした \- おじんブログ](https://mr-ozin.hatenablog.jp/entry/2021/10/15/005554) でも言及されている通り、画像配信が高速でただの静的な Web サイトのホスティングには現状は最適と判断した。

もし Vercel の Hobby プランの制約に縛られたくない事情[^2]が出てきたら、AWS あたりに乗り換えようかと思っている。

## 今後

技術記事は、基本的に外部のプラットフォームに投稿していたが、ぶっちゃけそのサイトとそれらとの使い分けについては明確に自分の中で決めていない。そういう事情もあるのでしばらくはどちらにも投稿するという不安定な運用をすることになりそうだ。

ただ、完全に自分だけのサイトと言うこともあり、自分の経験がよりほやほやなうちにクオリティよりもスピード重視でメモ書き程度にアップしていけたらいいなと思っている。

[^1]: [Amazon Route 53 に登録できる最上位ドメイン \- Amazon Route 53](https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/registrar-tld-list.html)

[^2]: 広告掲載は Hobby プランでは許可されていないとのこと。[Vercel の料金形態と内容についてまとめた \- 2020 冬](https://zenn.dev/lollipop_onl/articles/eoz-vercel-pricing-2020) に分かりやすくまとめられている。
