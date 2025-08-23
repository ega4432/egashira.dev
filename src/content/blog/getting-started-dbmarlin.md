---
title: "DBmarlin を触ってみた記録"
date: "2025-08-23"
tags: ["DBmarlin", "Docker", "PostgreSQL"]
draft: false
summary: "DBmarlin を使ってDocker環境下でPostgreSQLの詳細なモニタリング体験を記録する記事。"
---

## はじめに

従来の APM ツールはアプリケーション全体のパフォーマンス監視に優れているが、データベース特有の挙動やパフォーマンス、クエリ実行の詳細な影響分析といった、より細かな情報を提供する点では限界がある。実際のシステム運用において、DB の状態やパフォーマンスが全体のシステムに大きな影響を与えるため、その詳細なモニタリングは非常に重要である。

- 触ったきっかけ:

  - 多くの APM ツールは広範な監視機能を持つが、DB に特化した細部（クエリごとの実行時間、ロック状態、キャッシュ効率など）の情報が不足している点に着目した。

- DBmarlin の優れている点:

  - リアルタイムでデータベースの詳細なモニタリングを実施し、クエリごとのパフォーマンスボトルネックや予期せぬロック状態、リソース使用状況など、深い洞察を提供する。
  - 従来の APM では捉えにくい DB 固有の問題を迅速に特定し、対策のヒントを与える。
  - Docker コンテナ環境など、現代的なデプロイ方式に容易に対応し、システム全体のパフォーマンス最適化に貢献する。

これらの理由から、DBmarlin の導入はシステム運用やパフォーマンス改善に大きな効果をもたらすと考え、実際に触ってみた。

## DBmarlin の概要

DBmarlin は、データベースのパフォーマンスや動作状況をリアルタイムで監視するためのツールである。従来の APM ツールと比べ、特に以下の点で優れている。

- 詳細なパフォーマンス計測: クエリの実行時間、リソース使用量、ロック状況など、データベース固有のメトリクスを詳細に収集・表示する。
- リアルタイムな可視化: リアルタイムのデータストリームを解析し、問題の早期発見やパフォーマンス低下の原因を迅速に特定する。
- 軽量な設計: システムへの負荷を最小限に抑えながら、必要な情報を効率的に取得する設計が特徴である。

また、DBmarlin は Docker などのコンテナ環境との相性が良く、柔軟なデプロイが可能である。これにより、開発環境や本番環境での運用時に、データベースの挙動を直感的に把握し、チューニングやトラブルシューティングに役立てることが可能である。

## DBmarlin を実際にローカルで立ててみる

まず、以下のコマンドを実行してリポジトリをクローンした。

本セクションでは、以下の URL を参考にして DBmarlin を実際にローカルで立てた。

https://github.com/DBmarlin/dbmarlin-docker

以下のコマンドを用いて、リポジトリをクローンし、設定ファイルを確認・調整した。

```sh
git clone git@github.com:DBmarlin/dbmarlin-docker.git dbmarlin-docker

cd dbmarlin-docker

vim docker/docker-compose.yml
```

上記の操作により、ローカル環境に `dbmarlin-docker` ディレクトリが作成され、`docker/docker-compose.yml` ファイルを編集することで、サービスの設定を確認および調整した。以下は該当する `docker-compose.yml` の設定例である。

```yaml
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

次に、以下のコマンドを実行して、定義されたコンテナを起動した。

```sh
docker compose up -d
```

このコマンドにより、 docker-compose.yml に定義された以下のコンテナが起動した:

- dbmarlin-server: メインの DBmarlin サーバーとして、詳細なデータモニタリングを提供する。
- dbmarlin-agent: サーバーとの連携を担うエージェントとして動作する。
- demo-db: PostgreSQL を搭載したデモ用データベースコンテナである。

この手順により、DBmarlin を含む複数のサービスがローカル環境で稼働し、PostgreSQL データベースの監視が可能になった。

## postgres に実際に負荷をかけてみる

以下のコマンドを実行して demo-postgres コンテナに接続し、SQL を実行した。

```sh
docker exec -it demo-postgres bash
```

コンテナ内で以下のように SQL を実行した.

```sh
echo "CREATE TABLE test(id SERIAL PRIMARY KEY, name TEXT);
INSERT INTO test(name) VALUES ('Alice'), ('Bob'), ('Charlie');
SELECT * FROM test;
" > sql/create-data.sql

psql -h localhost -U postgres -d postgres -f sql/create-data.sql
```

その後、pgbench コマンドで負荷をかけた.

```sh
pgbench -h localhost -p 5432 -U postgres -d postgres -i
```

```sh
pgbench -h localhost -p 5432 -U postgres -d postgres -c 10 -t 100
```

## APM との連携

DBmarlin は Instana などの APM ツールとの連携が可能である。Instana と連携させることで、アプリケーションおよびデータベースのパフォーマンスを統合的に監視でき、異常検知やトラブルシューティングが迅速に行える。

下記の YouTube 動画が非常に参考となる.

https://youtu.be/0Bs1G2f8RGU?si=rut9FFB191Tg_pTq

Instana との連携については本記事では触れないが、次回以降の記事で詳しく解説する予定である。

## まとめ

本記事では、DBmarlin を用いて Docker 環境下での PostgreSQL 監視体験を記録した。各種コンテナの起動方法、実際の負荷テスト、そして APM ツール（Instana を例にとるが、汎用的に APM との連携が可能である）との連携について解説した。これにより、システム全体のパフォーマンスを詳細に監視し、異常の早期検知や迅速なトラブルシューティングが実現できることを確認した。今後は、さらなる運用改善や新たな監視機能の追加により、より高度なモニタリング環境の構築を目指す予定である。

## 参考

https://github.com/DBmarlin/dbmarlin-docker

https://www.instana.com

https://youtu.be/0Bs1G2f8RGU?si=rut9FFB191Tg_pTq
