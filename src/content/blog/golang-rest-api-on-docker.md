---
title: Docker で Go の REST API 環境を作ってみた
date: "2022-07-16"
tags: ["Docker", "Go", "MySQL", "API", "REST"]
draft: false
summary: Go + MySQL な環境を Docker で作ったので工夫したポイントなど
---

## はじめに

フレームワークを利用することなく、プレーンな構成で API を実装してみようと思い、そのために Docker で環境を作ってみた。その過程で工夫したポイントや苦労したことなどをまとめる。

Go には現在キャッチアップ中なので、一般的なディレクトリ構成とは異なっている部分もあるかもしれないが、今後も学習し次第適宜修正していきたい。

## 作ったもの

こちらに公開している。

https://github.com/ega4432/go-rest-api-docker

Docker でサクッと動かせる環境が欲しい時はぜひ使ってもらえると嬉しい。

## ディレクトリ構成

先に全体感を見せるとこんな感じになった。

```sh
$ tree -a -I .git -L 3 --gitignore
.
├── .dockerignore
├── .env.example
├── .gitignore
├── README.md
├── app
│   ├── .air.toml
│   ├── controllers
│   │   └── tasks.go
│   ├── database
│   │   └── database.go
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── build
│   ├── api
│   │   ├── Dockerfile.dev
│   │   └── Dockerfile.prod
│   └── db
│       ├── Dockerfile
│       ├── conf.d
│       └── initdb.d
└── docker-compose.yaml

8 directories, 14 files
```

簡単に内容を解説する。

### app ディレクトリ

REST API のソースコードを配置している場所。基本的に新しい機能を実装する場合はこちらを触ることになる。

更にこの中身のディレクトリ構造についてはまだ深掘れていないので今回は割愛する。

### build ディレクトリ

Dockerfile をはじめとする主にコンテナに関する設定ファイルを格納している。api, db という子ディレクトリは Docker Compose のサービス名（コンテナ）と一致させることで分かり易くしている。

### docker-compose.yaml

コンテナとして api, db と 2 つに分けて設計した。

```yaml title="docker-compose.yaml" showLineNumbers
version: "3"

services:
  api:
    build:
      context: .
      dockerfile: build/api/Dockerfile.dev
    container_name: api
    depends_on:
      - db
    env_file:
      - .env
    ports:
      - target: 8080
        published: 8080
        protocol: TCP
        mode: host
    stdin_open: true
    tty: true
    volumes:
      - type: bind
        source: app
        target: /go/src/app

  db:
    build:
      context: .
      dockerfile: build/db/Dockerfile
    container_name: db
    env_file:
      - .env
    ports:
      - target: 3306
        published: 3306
        protocol: TCP
        mode: host
    restart: always
    volumes:
      - type: volume
        source: db-data
        target: /var/lib/mysql
        volume:
          nocopy: true

volumes:
  db-data:
```

`services.[service_name].ports`, `services.[service_name].volumes` のところでは long syntax[^1] を使って書いた。ファイルの長さは長くなってしまうが、基本的には long syntax を使うようにしている。理由としては short syntax だと挙動が意図したものと異なった場合バグの発見に苦労するからだ。

データストアとしては自分が慣れている MySQL をバックエンドとして採用した。コンテナを落としてもデータを保存しておきたかったので `volumes` で名前付きボリュームを作成し、db コンテナの `/var/lib/mysql` にマウントしデータの永続化を実現した。

[Mysql \- Official Image \| Docker Hub](https://hub.docker.com/_/mysql)

また、api コンテナについてはバックエンドの db コンテナに接続する前提なので `depends_on` を利用して依存関係を定義している。

## 工夫したポイント

### Go のホットリロード

Go の開発で Docker を使うと定期的にコンテナを再起動するのが面倒だなと思って調べると、ホットリロードを提供している **cosmtrek/air** というツールを見つけたので使ってみることにした。

[cosmtrek/air: ☁️ Live reload for Go apps](https://github.com/cosmtrek/air)

`.air.toml` というファイルに設定を書くことでカスタマイズできるが、今回はお試しということでデフォルトの設定で使用している。今後おすすめの設定が発見できたら紹介したいと思う。

Docker Compose は基本的にローカルでのコンテナ環境なので、Dockerfile を `build/api/Dockerfile.dev` とし、その中で air をインストール、起動している。

本番へのデプロイを考えると air は必要ないので別で `build/api/Dockerfile.prod` にマルチステージビルドなどを用いて更にイメージの軽量化を図る予定（未完成）。

### MySQL のコンテナに初期データを入れる

[公式のドキュメント](https://hub.docker.com/_/mysql)を見ると次のような記載がある。

> When a container is started for the first time, a new database with the specified name will be created and initialized with the provided configuration variables. Furthermore, it will execute files with extensions .sh, .sql and .sql.gz that are found in /docker-entrypoint-initdb.d. Files will be executed in alphabetical order. You can easily populate your mysql services by mounting a SQL dump into that directory and provide custom images with contributed data. SQL files will be imported by default to the database specified by the MYSQL_DATABASE variable.

`/docker-entrypoint-initdb.d` に `.sh`, `.sql`, `.sql.gz` などの拡張子のファイルをマウントすると初期データを dump できる。

Dockerfile で次のようにすることで、初期データを dump した。

```dockerfile title="build/db/Dockerfile" showLineNumbers {4}
FROM mysql:8.0

COPY build/db/conf.d/ /etc/mysql/conf.d/
COPY build/db/initdb.d/ /docker-entrypoint-initdb.d/
```

## まとめ

Go の REST API 環境を Docker で作ってみた。
いろいろともっと良いやり方があるとは思うが、いいものはどんどん取り込んでいきたいなと思う！

## 参考

https://hub.docker.com/_/golang

https://hub.docker.com/_/mysql

https://docs.docker.com/compose/compose-file/

https://github.com/cosmtrek/air

[^1]: [Compose file version 3 reference \| Docker Documentation](https://docs.docker.com/compose/compose-file/compose-file-v3/#long-syntax)
