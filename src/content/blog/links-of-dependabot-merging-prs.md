---
createdAt: "2023-02-19T09:21:00.000Z"
updatedAt: "2023-03-12T11:05:00.000Z"
summary: "調べてみると多くの知見が見つかったのでメモ"
tags:
  - "Dependabot"
  - "CI/CD"
  - "Note"
date: "2023-02-19"
draft: false
title: "Dependabot が作る patch version up を自動でマージしたくて調べた"
---

面倒を見ているリポジトリが多くなってきたので、dependabot を設定していたが今後はそれが作った Pull Request の面倒を見きれなくなっている状況だった。今日は重い腰を上げてそれらを自動でレビュー、マージする設定を試していた。とりあえずは参考にした記事を貼っておく。

- [GitHub Dependabot が自動作成してくれる PR の中で、パッチバージョンの更新だけ AutoMerge する \| DevelopersIO](https://dev.classmethod.jp/articles/github-dependabot-auto-merge/)
- [Dependabot Pull Request の auto approve と auto merge \- Qiita](https://qiita.com/frozenbonito/items/6fb2fd438a7742eb7b5a#dependabot-merge-%E3%81%A7%E3%83%9E%E3%83%BC%E3%82%B8%E3%81%95%E3%81%9B%E3%82%8B-%E6%88%90%E5%8A%9F)
- [Dependabot 運用を自動化したい \- MoneyForward Developers Blog](https://moneyforward-dev.jp/entry/2022/12/16/dependabot-automation/)
- [GitHub App を使って Dependabot が作る pull request を自動マージさせる \- inSmartBank](https://blog.smartbank.co.jp/entry/2023/02/16/dependabot-auto-merge-with-github-app)
