---
title: "データベース可視化ツール DBmarlin を触ってみた"
date: "2025-08-23"
tags: ["DBmarlin", "Docker", "DB"]
draft: false
summary: "DBmarlin を Docker で立てて動かしたメモ"
---

## はじめに

従来の APM ツールはアプリケーション全体のパフォーマンス監視に優れているが、データベース特有の挙動やパフォーマンス、クエリ実行の詳細な影響分析といった、より細かな情報を提供する点では限界がある。

実際のシステム運用において、DB の状態やパフォーマンスが全体のシステムに大きな影響を与えるため、その詳細なモニタリングは非常に重要である。

ネット上で調べてもあまり日本語記事が見つからなかったため、ある一定のニーズはあるのはないかということで雑に記事にしてみた。

## DBmarlin の概要

DBmarlin は、データベースのパフォーマンスや動作状況をリアルタイムで監視するためのツールである。従来の APM ツールと比べ、特に以下の点で優れている。

- 詳細なパフォーマンス計測: クエリの実行時間、リソース使用量、ロック状況など、データベース固有のメトリクスを詳細に収集・表示する。
- リアルタイムな可視化: リアルタイムのデータストリームを解析し、問題の早期発見やパフォーマンス低下の原因を迅速に特定する。
- 軽量な設計: システムへの負荷を最小限に抑えながら、必要な情報を効率的に取得する設計が特徴である。

より詳細な特徴などについては公式を参照いただければと思う。

https://www.dbmarlin.com/

## DBmarlin を実際にローカルで立ててみる

以下の公式 GitHub を参考にして DBmarlin を実際にローカルで立てた。

https://github.com/DBmarlin/dbmarlin-docker

まずは、リポジトリをクローンし、設定ファイルを微調整した。

```sh
$ git clone git@github.com:DBmarlin/dbmarlin-docker.git

$ cd dbmarlin-docker

$ vim docker/docker-compose.yml
```

```yml:docker-compose.yml
services:
  dbmarlin-server:
    image: dbmarlin/dbmarlin-server:latest
    container_name: dbmarlin-server
    platform: linux/amd64
    ports:
      - "9080:9080"
      - "9090:9090"
  dbmarlin-agent:
    image: dbmarlin/dbmarlin-agent:latest
    container_name: dbmarlin-agent
    platform: linux/amd64
    environment:
      DBMARLIN_AGENT_NAME: local-agent
      DBMARLIN_ARCHIVER_URL: http://dbmarlin-server:9090/archiver
      DBMARLIN_API_KEY:
    depends_on:
      - dbmarlin-server

  demo-db:
    image: postgres:16
    container_name: demo-postgres
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10
```

次に、以下のコマンドを実行してコンテナを起動する。

```sh
$ docker compose up -d
```

これで docker-compose.yml に定義された以下のコンテナが起動する。

- dbmarlin-server
  - DBmarlin サーバーとして、モニタリングと UI ダッシュボードを提供する
- dbmarlin-agent
  - サーバーとの連携を担うエージェントとして動作する
- demo-db
  - PostgreSQL を搭載したデモ用データベースコンテナ

正常に全てのコンテナが起動できていれば、ブラウザで [localhost:9090](http://localhost:9090) にアクセスすると DBmarlin のダッシュボードが確認できるはずだ。

なお、デモ用の PostgreSQL をデータベースインスタンスとして登録するとモニタリングができるようになる。docker compose でコンテナ間通信されているため、ホスト名にコンテナ名を指定することで通信ができるはず。（スクショなどがあった方がいいかも、、、）

## PostgreSQL に実際に負荷をかけてみる

DBmarlin 側で PostgreSQL のモニタリング設定ができた上で、実際にデータベースに負荷をかけてみる。

負荷をかけるには、demo-postgres コンテナに入って作業した。

```sh
$ docker exec -it demo-postgres bash
```

まずは、SQL ファイルを作成する。

```sh
$ echo "CREATE TABLE test(id SERIAL PRIMARY KEY, name TEXT);
INSERT INTO test(name) VALUES ('Alice'), ('Bob'), ('Charlie');
SELECT * FROM test;
" > sql/create-data.sql

$ psql -h localhost -U postgres -d postgres -f sql/create-data.sql
```

その後、pgbench コマンドで負荷をかけた。

```sh
$ pgbench -h localhost -p 5432 -U postgres -d postgres -i
```

```sh
$ pgbench -h localhost -p 5432 -U postgres -d postgres -c 10 -t 100
```

数分待つと DBmarlin のダッシュボード上で異常な数値が計測できているはずだ。

## おまけ）APM との連携

DBmarlin は APM ツールである Instana との連携が可能である。Instana と連携させることで、アプリケーションおよびデータベースのパフォーマンスを統合的に監視でき、異常検知やトラブルシューティングが迅速に行える。

https://www.instana.com

下記の YouTube 動画が非常に参考となった。

https://youtu.be/0Bs1G2f8RGU?si=rut9FFB191Tg_pTq

Instana との連携については本記事では触れないが、次回以降の記事で詳しく解説する予定である。

## まとめ

本記事では、DBmarlin を用いて Docker 環境下での PostgreSQL を監視するチュートリアルをやってみた。

日本語記事がまだまだ少ないと思うので、興味がある人はぜひ参考にして欲しい。

## 参考

https://amzn.to/46B1PvK

https://amzn.to/4mcCFbi

https://amzn.to/3VJPuPI
