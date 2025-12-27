---
title: Vercel bot がデプロイした後に任意の処理を実行する
date: "2022-05-29"
tags: ["Vercel", "GitHub", "GitHub Actions", "CI/CD"]
draft: false
summary: Vercel bot のデプロイ後に処理をする方法について検討してみた。
---

## はじめに

ホスティングサービス [Vercel](https://vercel.com/) には GitHub 連携機能があり、連携済みの GitHub リポジトリへの push や Pull Request などをトリガーに自動でデプロイを行ってくれる。ちなみに本サイトも Vercel でホスティングしている。ある時に、この Vercel bot のデプロイ後に何かしら処理を行いたい場合、ググってもあまり情報が出てこなくて困ったので記事にしてみる。

## 結論

GitHub Actions で [`deployment_status`](https://docs.github.com/ja/actions/using-workflows/events-that-trigger-workflows#deployment_status) というイベントをトリガーとすることで実現できる。

```yaml title=".github/workflows/deploy-after-action.yaml" showLineNumbers
name: Handle after Vercel bot deploys

on: [deployment_status]

jobs:
  Handle:
    name: handle
    runs-on: ubuntu-latest
    steps:
      # One or several steps
```

公式の関連するドキュメントを見つけたので記載しておく。

[How Do I Get Notified When My Vercel Deployment Fails? – Vercel Docs](https://vercel.com/support/articles/how-do-i-get-notified-when-my-vercel-deployment-fails)

## Vercel bot は何をしているのか

結論から先に言ってしまったが、具体的にどういう流れになるのか追っていこうと思う。

先程述べた Vercel の自動デプロイは push や Pull Reuqest をトリガーとして Vercel bot という GitHub App が担っている。

[GitHub Apps \- Vercel](https://github.com/apps/vercel)

仕組みとしては、ある決まったイベントをトリガーに Vercel bot が GitHub API をコールすることで Pull Reuqest へのコメントやデプロイを実現している。この Vercel bot は通常 CI/CD を構築する手間を削減してくれる一方で、ユーザ側からは隠蔽されている。

## いろんなユースケース

Vercel bot のデプロイ後の処理で考えられるユースケースとその実現方法について検討してみたので記載する。

### デプロイ結果によって処理を分けたい場合

ワークフロー構文の if 条件を付けることで Vercel bot のデプロイが成功した場合と、失敗した場合の処理を分けることができる。例えば下記のようなことが考えられる。

- デプロイが成功したらブログの更新を Twitter に投稿する
- デプロイが失敗したら Slack へ通知する

```yaml title=".github/workflows/deploy-after-action.yaml" showLineNumbers
name: Handle after Vercel bot deploys

on: [deployment_status]

jobs:
  success-job:
    name: In case of successful
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success' # [!code ++]
    steps:
      # One or several steps
  failure-job:
    name: In case of failure
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'failure' # [!code ++]
    steps:
      # One or several steps
```

### 特定のブランチでフィルタリングしたい場合

通常 push や Pull Request では下記のようにできる。

```yaml showLineNumbers
on:
  push:
    branches:
      - main
      - "feature/**"
```

しかし、deployment_status では、ブランチによるイベントのフィルタができない。回避策としては、デプロイする環境でデフォルトブランチ（main/master）とそれ以外で区別する。

2022/05 現在ではそれしか対処法がないと思うが、もしこうやったらできるよという対策があれば教えていただきたい:pray:

```yaml title=".github/workflows/deploy-after-action.yaml" showLineNumbers
name: Handle after Vercel bot deploys

on: [deployment_status]

jobs:
  production-env:
    name: In case of production
    runs-on: ubuntu-latest
    if: github.event.deployment.environment == 'Prorduction' # [!code ++]
    steps:
      # One or several steps
  preview-env:
    name: In case of preview
    runs-on: ubuntu-latest
    if: github.event.deployment.environment == 'Preview' # [!code ++]
    steps:
      # One or several steps
```

## まとめ

Vercel bot のデプロイ後に処理をする方法について検討してみた。微妙に痒いところに手が届かず、詳細に制御したい場合は内部でロジックを組み立てる必要がありそう。

## 参考

https://vercel.com/support/articles/how-do-i-get-notified-when-my-vercel-deployment-fails

https://stackoverflow.com/questions/69629468/github-workflow-only-on-deployment-status-and-specific-branch
