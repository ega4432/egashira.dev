---
createdAt: "2023-02-19T09:21:00.000Z"
updatedAt: "2023-03-03T11:12:00.000Z"
summary: ""
tags: []
slug: "dependabot-merges-prs-automatically"
date: "2023-02-19"
draft: false
title: "Dependabot が作る patch version up を自動でマージする"
---

## Dependabot

面倒を見ているリポジトリが多くなってきたので、dependabot を設定していたが今後はそれが作った Pull Request の面倒を見きれなくなっている状況だった。今日は重い腰を上げてそれらを自動でレビュー、マージする設定を試していた。どこかで得た知見をブログにまとめたいが、とりあえずは参考にした記事を貼っておく。

- [GitHub Dependabot が自動作成してくれる PR の中で、パッチバージョンの更新だけ AutoMerge する \| DevelopersIO](https://dev.classmethod.jp/articles/github-dependabot-auto-merge/)
- [Dependabot Pull Request の auto approve と auto merge \- Qiita](https://qiita.com/frozenbonito/items/6fb2fd438a7742eb7b5a#dependabot-merge-%E3%81%A7%E3%83%9E%E3%83%BC%E3%82%B8%E3%81%95%E3%81%9B%E3%82%8B-%E6%88%90%E5%8A%9F)
- [Dependabot 運用を自動化したい \- MoneyForward Developers Blog](https://moneyforward-dev.jp/entry/2022/12/16/dependabot-automation/)
- [GitHub App を使って Dependabot が作る pull request を自動マージさせる \- inSmartBank](https://blog.smartbank.co.jp/entry/2023/02/16/dependabot-auto-merge-with-github-app)

## 引っ越しの準備

ものを捨てたり、実家に送ったりして少しずつ進めている。ゴミ袋高い。。。

やったこと

- QurioLock の初期化
  - [ロックの初期化 – Qrio 株式会社](https://support.qrio.me/hc/ja/articles/7029277495833-%E3%83%AD%E3%83%83%E3%82%AF%E3%81%AE%E5%88%9D%E6%9C%9F%E5%8C%96)
- 福岡市不燃ゴミの捨て方
  - [福岡市 燃えないごみの分け方・出し方](https://www.city.fukuoka.lg.jp/kankyo/jigyokeigomi/life/katei-bunbetsu/moenaigomi.html)
