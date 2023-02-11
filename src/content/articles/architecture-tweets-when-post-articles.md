---
title: ブログ記事を投稿したら自動でツイートする仕組みを作った
date: "2022-09-27"
tags: ["Architecture", "Vercel", "AWS", "SAM", "GitHub Actions"]
draft: false
summary: 結構前に作ったが割と運用が回ってきたので知見をまとめる
---

## はじめに

このブログで、「ブログ記事を投稿したらツイートする仕組み」を作ったので、その実現方法についてまとめておく。

正直世の中の一般的なブログサービス、技術サイト、WordPress などを使用している場合、SNS 連携機能が提供されていたり、Webhook の設定程度で実現可能であることも多々ある。その場合は全く関係のない話になることを先に言及しておく。だが、このサイトは個人ブログとして運用しているため今回のような仕組みから自分で考えて実装してみた。

## アーキテクチャ全体像

こんな感じの構成になった。

![architecture](https://i.imgur.com/5kOSwiF.webp)

- 執筆者（自分）が記事を書いて GitHub に Push, Pull Request を作成、マージする。
- Vercel bot が自動でデプロイを実行し、完了したら Deployment Status を作成する。
- Deployment Status の作成をトリガに GitHub Actions が起動し、もろもろの条件を確認して、API Gateway のエンドポイントにリクエストを送る。
- バックエンドの Lambda が処理を捌き、Twitter API を使ってツイートを送信する。

## GitHub Actions 全体像

上記の一連のフローを実現している GitHub Actions の YAML を貼ると以下のようなかたちになっている。詳細については後述する。

```yaml:.github/workflows/tweet.yaml showLineNumbers
name: Tweet

on: [deployment_status]

jobs:
  check:
    name: Check latest pull request
    runs-on: ubuntu-latest
    if: |
      github.event.deployment_status.state == 'success' &&
      github.event.deployment.environment == 'Production'
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Get latest pull request
        id: latest-pr
        run: |
          LATEST_PR=$(gh pr list \
            --state merged \
            --label tweet \
            --limit 1 \
            --base main \
            --search 'sort:updated-desc' \
            --json mergeCommit \
            --jq '.[]')
          echo "::set-output name=merge_commit::$(echo $LATEST_PR | jq -r '.mergeCommit.oid')"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Validate
        if: steps.latest-pr.outputs.merge_commit == github.event.deployment.ref
        id: validate
        run: echo "::set-output name=is_tweet::true"
    outputs:
      is_tweet: ${{ steps.validate.outputs.is_tweet }}

  tweet:
    name: Tweet via AWS Lambda
    runs-on: ubuntu-latest
    needs: check
    if: |
      always() &&
      (needs.check.result == 'success') &&
      (needs.check.outputs.is_tweet == 'true')
    steps:
      - name: Setup go
        uses: actions/setup-go@v2
        with:
          go-version: '1.18'
      - name: Install rss-feed command
        run: go install github.com/ega4432/rss-feed@latest
      - name: Fetch feed
        run: rss-feed -u https://egashira.dev/feed.xml --latest > feed.json
      - name: Set variable
        id: set-var
        run: |
          TITLE=$(cat feed.json | jq -r '.title')
          LINK=$(cat feed.json | jq -r '.link')
          TWEET_TEXT="${{ secrets.TWEET_TEXT_PREFIX }} ${TITLE} ${LINK}"
          echo "::set-output name=text::$TWEET_TEXT"
      - name: Request to API Gateway
        run: |
          echo "{ \"text\": \"${{ steps.set-var.outputs.text }}\" }" | curl -X POST "${{ secrets.API_GATEWAY_URL }}/tweet" \
            -H "Content-type: application/json" \
            -d @-
```

## Vercel のデプロイ完了をトリガとして GitHub Actions を起動する

Vercel へのデプロイが完了した後にツイートさせたいので `on.deployment_status` をトリガとした Action を作った。

Vercel のデプロイを担っている Vercel bot の挙動について以下の記事に詳しくまとめている。

https://egashira.dev/blog/handle-after-vercel-bot-deploys

プレビューへのデプロイと差別化するため `github.event.deployment_status.state == 'success' && github.event.deployment.environment == 'Production'` という条件でフィルタリングしている。

## マージされた PR が記事の投稿かを判断する

`gh` コマンドで最新の PR 情報を取得している。その際にポイントとなるのは判別用の `tweet` ラベルが PR に付いていれば以後の処理が実行されるため PR を作る際にこれだけは手動で付与しておく必要がある。

また GitHub CLI の詳細については以下の記事に詳しくまとめている。

https://egashira.dev/blog/get-latest-pr-via-github-cli

```yaml showLineNumbers
- name: Get latest pull request
  id: latest-pr
  run: |
    LATEST_PR=$(gh pr list \
      --state merged \
      --label tweet \
      --limit 1 \
      --base main \
      --search 'sort:updated-desc' \
      --json mergeCommit \
      --jq '.[]')
    echo "::set-output name=merge_commit::$(echo $LATEST_PR | jq -r '.mergeCommit.oid')"
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
- name: Validate
  if: steps.latest-pr.outputs.merge_commit == github.event.deployment.ref
  id: validate
  run: echo "::set-output name=is_tweet::true"
```

`if: steps.latest-pr.outputs.merge_commit == github.event.deployment.ref` の部分だが、上記の `gh` コマンドで取得した最終 commit と実際にデプロイが走るきっかけとなった commit が同じかどうかを比較している。同じだった場合 `is_tweet` というフラグ用の変数を立てて `outputs` を使って後続のジョブで取得できるようにしている。

もし最新でない場合は、`is_tweet` が true とならずに後続のジョブは Skip される。

![Example for skipped workflow](https://i.imgur.com/aBvrB3r.webp)

## RSS フィードにより最新記事を取得

このブログサイトには、記事一覧取得系の API を用意していないので RSS フィードから最新記事を取得することにした(もっといいやり方はあると思う)。

自作コマンド [rss-feed](https://github.com/ega4432/rss-feed) を使って最新の一件だけを取得し、いい感じにタイトル、URL を整形した形で `text` という変数に格納した。

```yaml showLineNumbers
- name: Install rss-feed command
  run: go install github.com/ega4432/rss-feed@latest
- name: Fetch feed
  run: rss-feed -u https://egashira.dev/feed.xml --latest > feed.json
- name: Set variable
  id: set-var
  run: |
    TITLE=$(cat feed.json | jq -r '.title')
    LINK=$(cat feed.json | jq -r '.link')
    TWEET_TEXT="${{ secrets.TWEET_TEXT_PREFIX }} ${TITLE} ${LINK}"
    echo "::set-output name=text::$TWEET_TEXT"
```

ちなみにこの rss-feed CLI は [spf13/cobra](https://github.com/spf13/cobra) というパッケージを使うことで爆速に作ることができた。CLI を作るときは今後も cobra を使うと思うくらいまじで便利。

## ツイートする API を用意する

こちらも Go で自作した twitter クライアントを API 化して AWS Lambda + API Gateway にデプロイした。cURL で叩けば事足りるだろと思われるかもしれないが、API 化しておくことで何かと今後叩きやすくしておいた意味がある。

[ega4432/go\-lambda\-twitter](https://github.com/ega4432/go-lambda-twitter)

こちらの開発では AWS SAM を使ってインフラのコード化にも挑戦してみたので非常に勉強になったし、その CI/CD 環境も初めて作ったので、今度詳しくブログにまとめたい。

デプロイした API Gateway に対して cURL でリクエストすることでツイートされる。

```yaml showLineNumbers
- name: Request to API Gateway
  run: |
    echo "{ \"text\": \"${{ steps.set-var.outputs.text }}\" }" | curl -X POST "${{ secrets.API_GATEWAY_URL }}/tweet" \
      -H "Content-type: application/json" \
      -d @-
```

バックエンドの Lambda で Twitter API を叩き、最終的にはこんな感じでツイートされる！

![Example for tweets](https://i.imgur.com/eSkjVEA.webp)

## まとめ

「ブログ記事を投稿したら自動でツイートする仕組み」について書いてみた。

自分で 1 から仕組みを作るのはいろんなことを考慮する必要があり楽しかった！

GitHub Actions のログを貼っておくが、最後までジョブが走ったとしても平均 30 秒ちょっとで完了している。

![Log of GitHub Actions](https://i.imgur.com/xep8D7P.webp)

将来的にはこの仕組を汎用的にして、他のことへも適用できるようなかたちにしたい。

## 参考

https://github.com/spf13/cobra

https://github.com/ega4432/go-lambda-twitter

https://github.com/ega4432/rss-feed
