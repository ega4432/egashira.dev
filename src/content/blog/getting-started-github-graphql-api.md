---
title: GitHub GraphQL API を使ってみた
date: "2022-11-13"
tags: ["GitHub", "GraphQL", "API"]
draft: false
summary: 今更ながら触ってみたので基本的なのクエリのメモ
---

## はじめに

ふと自分の GitHub アカウント上の活動を楽に取得できないかを考えていたところ、そう言えば GitHub GraphQL API 触ったことがないなと思ったので GraphQL の勉強も兼ねて触ってみた。

## GitHub GraphQL API Explorer

GitHub 公式が提供している以下のサイトで実際に API を叩くことができる。

[エクスプローラー \- GitHub Docs](https://docs.github.com/ja/graphql/overview/explorer)

使ったことがない方向けにざっくりと見方を説明するとメインの左側に GraphQL のクエリを書き、実行した結果が右側に表示されるという感じである。また、クエリに対して引数を渡したい場合は、下の `QUERY VARIABLES` に定義することで変数を動的に変更しながらの実行も可能。

![GitHub GraphQL API Explorer screenshot](https://i.imgur.com/rOeawpm.webp)

## ログインユーザの情報を取得

viewer query を使ってログインしているユーザの情報を取得できる。というオブジェクトでユーザの情報や所持しているリポジトリの情報を取得できる。

[viewer \- GitHub Docs](https://docs.github.com/ja/graphql/reference/queries#viewer)

```graphql showLineNumbers
query {
  viewer {
    login
    name
    location
    bio
    avatarUrl
  }
}
```

User オブジェクトが取得でき、ここでは login, name, location などのフィールドを 5 つ指定しており、結果は以下のような JSON が返却される。

```json showLineNumbers
{
  "data": {
    "viewer": {
      "login": "ega4432",
      "name": "ega4432",
      "location": "Fukuoka, Japan",
      "bio": "I'm a software engineer based in Fukuoka, Japan.",
      "avatarUrl": "https://avatars.githubusercontent.com/u/38056766?u=d1ebbfd794cfdfb71f13a358da233571d04ed166&v=4"
    }
  }
}
```

フィールド名や型については下記のドキュメントで詳細を確認できる。

https://docs.github.com/ja/graphql/reference/objects#user

## ユーザの情報を取得

上記の viewer の場合はログインユーザになってしまうので、id 指定でユーザ情報を取得するには user query を使用する。

[user \- GitHub Docs](https://docs.github.com/ja/graphql/reference/queries#viewer)

引数に login を与えることで特定のユーザを指定できる。ここでは、とりあえずクエリの中に自分の id を直書きしているが引数を渡す方法については後述する。

```graphql showLineNumbers
query {
  user(login: "ega4432") {
    login
    name
    websiteUrl
    url
    avatarUrl
  }
}
```

結果は以下の JSON が返ってくる。

```json showLineNumbers
{
  "data": {
    "user": {
      "login": "ega4432",
      "name": "ega4432",
      "websiteUrl": "https://egashira.dev",
      "url": "https://github.com/ega4432",
      "avatarUrl": "https://avatars.githubusercontent.com/u/38056766?u=d1ebbfd794cfdfb71f13a358da233571d04ed166&v=4"
    }
  }
}
```

### リポジトリ一覧を取得

更に一歩進んで User オブジェクトには `repositories` というフィールドがあり、それでリポジトリ一覧が取得できそうだったのでやってみた。

[User \- GitHub Docs](https://docs.github.com/en/graphql/reference/objects#user)

```graphql showLineNumbers
query ($userName: String!) {
  user(login: $userName) {
    repositories(last: 100) {
      totalCount
      edges {
        node {
          id
          url
          nameWithOwner
          description
          homepageUrl
        }
      }
    }
  }
}
```

`repositories` の引数には条件として `first` あるいは `last` で指定しないと以下のエラーが出るため指定する。とりあえずできる限り全部のデータを取得したかったのでマックスの 100 を指定した。

> You must provide a `first` or `last` value to properly paginate the `repositories` connection.

また、前述の箇所では引数 login フィールドの値を直書きしていたので変数を使う感じに変更した。

下の QUERY VARIABLES に以下のような JSON を定義することでクエリの引数として与えることができる。

```json showLineNumbers
{
  "userName": "ega4432"
}
```

結果としては、途中省略してはいるが以下のように repositories フィールドにリポジトリの一覧を取得できた。

```json showLineNumbers
{
  "data": {
    "user": {
      "repositories": {
        "totalCount": 97,
        "edges": [
          {
            "node": {
              "id": "MDEwOlJlcG9zaXRvcnkxMjk1ODYyNTY=",
              "url": "https://github.com/ega4432/hoge-fuga",
              "nameWithOwner": "ega4432/hoge-fuga",
              "description": null,
              "homepageUrl": null
            }
          },
          {
            "node": {
              "id": "MDEwOlJlcG9zaXRvcnkxMzE4MjUzNTE=",
              "url": "https://github.com/ega4432/toy_app",
              "nameWithOwner": "ega4432/toy_app",
              "description": null,
              "homepageUrl": null
            }
          },
          // ....
          // 省略
          // ...
          {
            "node": {
              "id": "R_kgDOH5NVAA",
              "url": "https://github.com/ega4432/notion-api-test",
              "nameWithOwner": "ega4432/notion-api-test",
              "description": null,
              "homepageUrl": null
            }
          },
          {
            "node": {
              "id": "MDEwOlJlcG9zaXRvcnkzODI3NDkzNjE=",
              "url": "https://github.com/ega4432/kindle-booklog-sync",
              "nameWithOwner": "ega4432/kindle-booklog-sync",
              "description": "automatically uploads books purchased on Kindle to Booklog.",
              "homepageUrl": ""
            }
        ]
      }
    }
  }
}
```

## まとめ

簡単ではあるが GitHub GraphQL API を使う取っ掛かりとして GraphQL Query Explorer を使ってみた。感想としては、欲しいデータが取れるかどうかを確認したい場合は非常に便利だと思ったし、REST API と違ってフィールドを指定するかしないかで取得できるデータを柔軟に調節できるのもいいなと思った。

もう少し触ってみて、ある期間の自分の活動の可視化などに活用してみたい。

## 参考

https://docs.github.com/en/graphql

https://docs.github.com/ja/graphql/overview/explorer

https://relay.dev/graphql/connections.htm

https://zenn.dev/hsaki/articles/github-graphql
