---
createdAt: "2023-02-10T12:11:00.000Z"
updatedAt: "2023-03-11T04:37:00.000Z"
summary: ""
tags:
  - "Note"
  - "Web"
date: "2023-02-10"
draft: false
title: "ブラウザのキャッシュ制御ってむずい"
---

この辺の記事を読んで実際にデプロイして挙動を見たりした。デプロイ先は Object Storage で静的 Web サイトホスティング機能を使った（nginx とか Apache とかサーバで試した訳ではないが内部的にそれらが使われているのでさほど変わらないと思う）

- [Cache\-Control \- HTTP \| MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Cache-Control)
- [ブラウザのキャッシュコントロールを正しく理解する \- Qiita](https://qiita.com/hkusu/items/d40aa8a70bacd2015dfa)
- [Cache\-Control とは？ \| キャッシュの概要 \| Cloudflare](https://www.cloudflare.com/ja-jp/learning/cdn/glossary/what-is-cache-control/)
- [キャッシュについて整理 \- Qiita](https://qiita.com/anchoor/items/2dc6ab8347c940ea4648)

各ヘッダについていくつかピックアップしてまとめる。

### Etag

リソースを一意に識別するための識別子。`"675af34563dc-tr34”` な感じ。

### Last-Modified

Etag ヘッダと同様にリソースを識別するための最後に変更された日時。Etag よりも精度が低く、代替として使用する。

### Cache-Control

いろいろ細かく指定できるディレクティブがある。

- must-revalidate
- no-cache
- no-store
- public
- private
- max-age
- s-maxage
- etc ….

今回は `max-age=0` を付与することにしたけど以下の記事が参考になった。

[max\-age=0 って何のメリットがあるの？](https://zenn.dev/praha/articles/1430a4100b2c8a)
