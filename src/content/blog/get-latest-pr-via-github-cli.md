---
title: GitHub CLI を使って一番最後にマージされた Pull Request を取得する方法
date: "2022-07-02"
tags: ["GitHub", "CLI", "Productivity"]
draft: false
summary: GitHub CLI を使ったちょっとした Tips の紹介
---

## はじめに

小ネタ記事。

GitHub でソースコード管理をしていて、ふと一番最後にマージされた Pull Request(以下 PR)の情報を取得したいと思うことがあった。調べた結果 GitHub CLI( `gh` コマンド)を使うと楽に実現できたので紹介する。

## 結論

```sh
$ gh pr list --base main --state merged --limit 1

Showing 1 of XXX pull requests in ega4432/<REPOSITORY> that match your search

#PR_NUMBER  Feature/#XX を実装した！  BRANCH_NAME>
```

それぞれのオプションの意味は下記のようになっているため、適宜ユースケースに応じて変更すれば良い。

- `--base` : マージされたブランチ
- `--limit` : 取得する件数
- `--state` : PR の状態

## JSON 形式で取得したい場合

`--json` オプションがあるので、バリューに取得したいフィールド名を与えることで JSON 形式で取得できる。

分かりやすいように 3 件にして実行した。

```sh
$ gh pr list --state merged \
  --base main \
  --limit 3 \
  --json number,title,mergeCommit
[
  {
    "mergeCommit": {
      "oid": "abcd1234abcd1234abcd1234abcd1234abcd"
    },
    "number": 121,
    "title": "Feature/#XX を実装した！"
  },
  {
    "mergeCommit": {
      "oid": "dcba4321dcba4321dcba4321dcba4321dcba"
    },
    "number": 119,
    "title": "bug: fixed typo"
  },
  {
    "mergeCommit": {
      "oid": "abcdefghi12345678abcdefghi12345678"
    },
    "number": 118,
    "title": "docs: update README.md"
  }
]
```

ここで利用できるフィールドは下記となっている。

```
additions
assignees
author
baseRefName
body
changedFiles
closed
closedAt
comments
commits
createdAt
deletions
files
headRefName
headRepository
headRepositoryOwner
id
isCrossRepository
isDraft
labels
latestReviews
maintainerCanModify
mergeCommit
mergeStateStatus
mergeable
mergedAt
mergedBy
milestone
number
potentialMergeCommit
projectCards
reactionGroups
reviewDecision
reviewRequests
reviews
state
statusCheckRollup
title
updatedAt
url
```

## JSON 形式で取得して jq で整形する

実は `--jq` オプションもある。使う場合は上記で説明した `--json` オプションと一緒に使う必要がある。

あまりユースケースは思いつかないが `#123 title` みたいに PR 番号とタイトルを結合した形式で取得するパターンを `--jq` オプションを使ってやってみる。

```sh
$ gh pr list --state merged \
  --base main \
  --limit 3 \
  --json number,title \
  --jq '.[] | .result = (.number|tostring) + " " + .title | .result'
121 Feature/#XX を実装した！
119 bug: fixed typo
118 docs: update README.md
```

そもそもの jq の使い方については下記の記事を参考にした。

- [jq コマンドを使う日常のご紹介 \- Qiita](https://qiita.com/takeshinoda@github/items/2dec7a72930ec1f658af)
- [jq コマンド\(json データの加工, 整形\)の使い方 \- わくわく Bank](https://www.wakuwakubank.com/posts/676-linux-jq/)
- [JSON データの操作に jq コマンド使ってみたら扱いやすかったので紹介したい \| DevelopersIO](https://dev.classmethod.jp/articles/json-jq-command/)

## まとめ

今回は、GitHub CLI を使った小ネタだった。

僕は、普段から Issue や PR の作成、PR ブランチへのチェックアウトなどは GitHub CLI でやる癖が付いているが、ここまでオプションが充実しているとは思っていなかったので、改めて発見だった。

ターミナルあるいは IDE とブラウザを行ったり来たりする手間もなくなるので GitHub CLI はおすすめだ！

## 参考

https://github.com/cli/cli

https://qiita.com/ryo2132/items/2a29dd7b1627af064d7b
