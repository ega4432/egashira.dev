---
createdAt: "2023-02-04T08:23:00.000Z"
updatedAt: "2023-03-12T01:27:00.000Z"
summary: ""
tags:
  - "GitHub"
  - "GitHub Actions"
  - "TypeScript"
  - "Note"
date: "2023-02-04"
draft: false
title: "初めて GitHub Actions を自作してる→作った"
---

昨日やり始めて雑だが取りあえず動くものを作った。

[bookmark](https://github.com/marketplace/actions/notion-to-markdown-action)

Notion から API 経由でデータを取得してローカルに Markdown ファイルとして保存するもの。GitHub 公式が [action を自作する場合のテンプレート](https://github.com/actions/typescript-action)を用意してくれているので、それを利用した。

ただし、現状だといくらか課題がある

- 画像が AWS S3 の署名付き URL で返ってくるので、それを外部アクセスできるようにするにはどうするか（有効期限が切れると閲覧できなくなる）
- そのまま GitHub にプッシュせずに PR 経由でマージするフローを検討する

今回始めて action を作ってみたが、いろんな知見が溜まった！
