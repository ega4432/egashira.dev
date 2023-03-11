---
createdAt: "2023-02-04T08:23:00.000Z"
updatedAt: "2023-03-09T15:01:00.000Z"
summary: "作業に没頭した土曜日だった"
tags:
  - "GitHub"
  - "GitHub Actions"
  - "TypeScript"
date: "2023-02-04"
draft: false
title: "初めて GitHub Actions を自作してる→作った"
---

## GitHub Actions 自作

昨日やり始めて雑だが取りあえず動くものを作った。

[bookmark](https://github.com/marketplace/actions/notion-to-markdown-action)

Notion から API 経由でデータを取得してローカルに Markdown ファイルとして保存するもの。GitHub 公式が [action を自作する場合のテンプレート](https://github.com/actions/typescript-action)を用意してくれているので、それを利用した。

ただし、現状だといくらか課題がある

- 画像が署名付き URL で返ってくるので、それを外部アクセスできるようにするにはどうするか
- そのまま GitHub にプッシュせずに PR 経由でマージするフローを検討する

今回始めて action を作ってみたが、いろんな知見が溜まったので忘れないうちにブログに書こうと思う。

## メンタリスト

![メンタリスト](http://www.superdramatv.com/line/mentalist/img/title.jpg)

相変わらずの名作ドラマ。作業の BGM として Netflix で流してたけど初めて観たときは本当にハマって観た記憶。
