---
createdAt: "2023-02-04T08:23:00.000Z"
updatedAt: "2023-04-01T08:01:00.000Z"
summary: "使う側から作る側へ。まずは自分にとってあれば便利なものを作ってみてる。"
tags:
  - "GitHub"
  - "GitHub Actions"
  - "TypeScript"
  - "Note"
date: "2023-02-04"
draft: false
title: "初めて GitHub Actions を自作してる→作った"
---

## 前回の記事

https://egashira.dev/blog/creating-my-own-first-github-action

## 本題

昨日から初の GitHub Action を作り始めた。一旦雑だが取りあえず動くところまではできた。

https://github.com/marketplace/actions/notion-to-markdown-action

Notion から API 経由でデータを取得してローカルに Markdown ファイルとして保存するもの。GitHub 公式が action を自作する場合のテンプレートを用意してくれているので、それを利用した。

https://github.com/actions/typescript-action

ただし、現状だといくらか課題がある。

- 画像が AWS S3 の署名付き URL で返ってくるので、それを外部アクセスできるようにするにはどうするか（有効期限が切れると閲覧できなくなる）
- そのまま GitHub にプッシュせずに PR 経由でマージするフローを検討する

今回始めて action を作ってみたが、いろんな知見が溜まった！
