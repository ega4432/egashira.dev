---
summary: "当サイトで使用しているドメインを移管したので、移管先の選定理由や行なった設定方法などについてまとめる。"
tags:
  - "Cloudflare"
  - "Google"
date: "2023-09-20"
draft: false
title: "Google Domains から Cloudflare Registrar へ移管した"
---

## はじめに

[Google Domains 事業売却のニュース](https://pc.watch.impress.co.jp/docs/news/1509296.html) を受けて、当サイトで使用しているドメインを移管したので、移管先の選定理由や行なった設定方法などについて書く(n 番煎じな記事ではあるが)。

結論から言うと Cloudflare のネームサーバで既に運用していたというのとネット上にもたくさん情報があったので Cloudflare Registrar に決めた。（.dev ドメインについては元々対応していなかったが、先月 [8 月に対応した](https://twitter.com/CloudflareDev/status/1686812617153593355) とのこと）

大まかな流れとしては以下の公式ドキュメントが参考になると思う。

https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/

以下の手順は既にネームサーバを Cloudflare 側で行っている前提での設定となるのでその点はご留意いただきたい。

ネームサーバを Cloudflare に設定していない場合は、事前に設定を変更しておく必要がある。

## Google Domains での移管準備

まずは、Google Domains 側で移管に向けて事前準備が必要なのでそれを行う。以下のスクショのようにロックを解除し、認証コードを取得する。

![Google Domains 側の設定](https://i.imgur.com/xWu5sbh.webp)

後で使用するので取得したコードは手元に控えておく。

## Cloudflare Registrar での移管作業

続いて Cloudflare のダッシュボードを開いて、作業を行っていく。

まずは、「ドメインの移管」から該当するドメインを選択する。

![ドメインの移管](https://i.imgur.com/PpKWgHq.webp)

![移管するドメインを選択](https://i.imgur.com/HiS845Q.webp)

次に、先程取得した認証コードの入力を求められるので、そちらを入力して次に進む。

![認証コードの入力](https://i.imgur.com/Qqli3h2.webp)

更に進むとドメインの WHOIS 情報の入力を求められるので、そちらを入力して確定する。

![WHOIS 情報の入力](https://i.imgur.com/sn7GZm6.webp)

先程の作業を行うと、本当に移管していいのか Google からメールが届くので、こちらを承認する。

![移管リクエストメール](https://i.imgur.com/JNjE0vH.webp)

ここまで作業が完了すると、Cloudflare のダッシュボード上で、以下のような状態になると思う。

![pending ステータス](https://i.imgur.com/4rE5MQm.webp)

反映されるまで、数時間かかるがしばらく経って見に行くとアクティブになっていたので、これで移管が完了した。

## あとがき: 楽天カードで決済がうまくいかない?!

移管にトライしていた際に、躓いたこととして以前 [X(Twitter) にもポストした](https://twitter.com/ega4432/status/1687675120872275968) のだが、なぜか上手く行かず、サポートに問い合わせたところ以下のような返信が来た。

```
Payment attempt with Visa •••• XXXX was declined

The bank returned the decline code do_not_honor,
and did not provide any other information. We
recommend that your customer contact their card
issuer, Rakuten Card Co., Ltd., for more
information, or use another payment method.
```

あきらめて別のクレジットカードで決済したところ問題なく移管できた。

意外と罠だったので、もし Cloudflare Registrar への移管を検討されている方がいたら別のクレジットカードか PayPal などの決済手段を選ぶと難なく移管できると思う。

## 参考

https://www.cloudflare.com/ja-jp/products/registrar/

https://www.cloudflare.com/ja-jp/tld-policies/

https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/

https://pc.watch.impress.co.jp/docs/news/1509296.html
