---
createdAt: "2023-05-13T03:38:00.000Z"
updatedAt: "2023-06-30T05:15:00.000Z"
summary: "GraphQL および周辺技術にキャッチアップするためのメモ。"
tags:
  - "GraphQL"
  - "API"
date: "2023-05-21"
draft: false
title: "GraphQL 素振り"
---

## はじめに

GraphQL および周辺技術にキャッチアップするための自分用メモ。

やること

- GraphQL
  - 概要
  - REST API との違い
- その他 GraphQL に関すること

## 登場人物

まずは概要をざっくり理解するために出てくる主な言葉の理解から。

### GraphQL

GraphQL は、クライアントとサーバサイドのデータ取得、応答をを行うためのクエリ言語。従来からデファクトスタンダードだった REST API の大体として 旧 Facebook 社によって作成され、今では GitHub や YouTube をはじめ多くのプロダクトの本番環境で利用されている。

https://graphql.org

GraphQL の特徴

- 柔軟なデータ取得
  - REST API の課題でもあるオーバーフェッチングを解決する最も目玉な特徴（だと僕が思っている）。クライアントは、必要なデータを明示的に指定することで、不要なデータの取得やリクエストを複数回にわたって行うことを防ぐことができる。
- 単一エンドポイント
  - GraphQL では通常単一のエンドポイントにより API が提供される。リソースとリソースへの操作によって HTTP メソッド、エンドポイントが存在する REST API と大きく異なる部分ではある。
  - まだあんまり理解できていないが、単一エンドポイントにリクエストが集中することに対するパフォーマンスととかへの影響はあるのだろうか 🤔
- スキーマ
  - GraphQL は厳密は型システムを提供するため、クライアントとサーバ間でデータの一貫性を保つことできる。

### Query

GraphQL でデータを取得する際に使用する。

一番シンプルなクエリで以下は、ユーザの一覧を取得するクエリとなっている。 user というフィールドのプロパティとして name, email を指定しているが、クライアント側が他にも取得したいプロパティがあれば随時追加するといった形でオーバーフェッチングを防ぐ。

```graphql
query {
  user {
    name
    email
    # age   随時追加していく
  }
}
```

続いてユーザの一覧から任意の id のユーザのみを取得するクエリはこんなかんじ。

フィールドに引数を渡すことが可能で、データのフィルタリングなどに使用できる。

```graphql
query {
  user(id: 123) {
    id
    name
    email
  }
}
```

さらにネストされたデータの取得はこんなかんじで記述できる。リレーショナルデータベースでリレーションを持つ子要素のデータを取得したい場合も対応できる。例えばユーザの情報に加えて、そのユーザが投稿した記事の一覧も欲しい場合は以下のように書く。

```graphql
query {
  user(id: 123) {
    id
    name
    posts {
      title
      description
    }
  }
}
```

### Fragment

GraphQL で共通するものをまとめて再利用可能にする機能。任意の型に対して定義でき、Query の中で JavaScript のスプレッド構文で利用できる。

```graphql
fragment UserName on User {
  firstname
  lastname
}

query {
  user {
    id
    email
    ...UserName
  }
}
```

### Mutation

GraphQL でデータを作成、更新および削除する際に使用する。Query と同様にフィールドに引数を渡すことが可能。

```graphql
mutation {
  createUser(data: { name: "John", email: "johndoe@example.com" }) {
    id
    name
    email
  }
}
```

### Subscription

WIP

## Apollo

WIP

## Next Action

概要をざっくり知ることができたので、引き継きインプットをしながら何か動くものを作りつつ理解をふかめていきたい。直近は以下のことを演る予定なので、またアップデートがあれば本サイトに記事を書こうと思う。

- Udemy を見る
  - https://www.udemy.com/course/graphql-tutorial-with-newsapp-api/
- 書籍を読む
  - https://www.oreilly.co.jp/books/9784873118932/
- Apollo を使って GraphQL サーバを作る
  - リポジトリだけは作った
    - https://github.com/ega4432/graphql-todo-app-sample

## 参考にしたサイトや資料、ドキュメントなど

https://zenn.dev/eringiv3/books/a85174531fd56a

https://zenn.dev/offers/articles/20220609-graphql-onboarding

https://www.udemy.com/course/graphql-tutorial-with-newsapp-api/
