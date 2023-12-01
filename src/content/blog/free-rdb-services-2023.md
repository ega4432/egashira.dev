---
title: "個人開発向け無料 RDB サービスまとめ 2023 年版"
tags:
  - "DB"
  - "個人開発"
  - "PaaS"
date: "2023-12-07"
draft: false
summary: "技術選定する際に頭を悩ます DB について最近はやっていそうなものをピックアップしてまとめみた"
---

## はじめに

最近、個人開発する上で DB の選択肢が多く、技術選定をする際に割りと頭を悩ます問題だと思う。この記事では、いくつかのサービスをピックアップして、それぞれの概要やコスト感、機能、制約などをまとめてみる。

あくまでも自分が個人開発に際して技術選定の材料とするもの。

## 今回対象にするサービス一覧

今回は以下の DB サービスをピックアップして紹介する。
料金などについては、更新が入るかもしれないので **2023 年末の情報**ということに留意していただければと思う。（それぞれ公式のリンクを添えておくので、そこから詳細を確認してもらえればmm）

- Neon
- Planetscale
- Render.com
- Supabase
- Vercel Storage
- 候補に上がらなかったサービス
  - Cloudflare D1
  - Heroku

また、選んだ基準としては以下の 2 点を優先している。

- 無料で使用できるプランがあるか
- RDB を使用できるか

## Neon

Neon は AWS Aurora Postgres に代わるサーバーレス DB を目指して開発されている OSS。ストレージとコンピューティングリソースを分離したアーキテクチャを採用したフルマネージドな PostgreSQL。

https://neon.tech/

- 料金
  - Free プランあり
    - 1 Project のみ
- ストレージ容量
  - Free プランの場合、ブランチ（後述）1 つにつき 3GiB
- スペック
  - Compute Units (CU) で表現される。1CU は 1vCPU, 4GB メモリ。
  - 無料枠では 0.25CU(1vCPU, 1GB メモリ)
- その他提供されている機能や情報
  - ブランチ機能 - ref. [Branching \- Neon Docs](https://neon.tech/docs/introduction/branching)
    - GitHub のブランチのようにデータを任意の時点で分岐できる機能。
    - Free プランの場合、ブランチは 10 個まで作れて、ブランチ一つにつき容量としては 3GiB。
  - Console - ref. [Neon console](https://console.neon.tech)
    - Console と呼ばれるブラウザでアクセスできるダッシュボードが提供されていて、モニタリング情報が見れたり、SQLEditor から SQL を直接実行できたり、かなり便利。
  - 使用できる PostgreSQL のバージョン - ref. [Postgres versions \- Neon Docs](https://neon.tech/docs/reference/compatibility#postgres-versions)
    - 14, 15, 16 が使える。デフォルトでは 15 が選択される。
- 注意点
  - 現在は日本リージョンはなく、一番近くてシンガポールになる（`aws-ap-southeast-1`）- ref. [リージョン](https://neon.tech/docs/introduction/regions#available-regions)

#### 参考記事、関連サイト

https://qiita.com/hibohiboo/items/68a3829e66e60b56ae5b

## Planetscale

スケール、パフォーマンス、信頼性を実現する MySQL 互換のマネージドでサーバーレス DB。

https://planetscale.com

- 料金
  - 無料の Hobby プランあり
- ストレージ容量
  - 5GB
- スペック
  - 10 億行 read/month
  - 1,000 万行 write/month
- コネクション数
  - 1,000
- リージョン
  - 東京リージョンあり - ref. [Regions — PlanetScale Documentation](https://planetscale.com/docs/concepts/regions#overview)
- その他提供されている機能
  - 自動バックアップ機能あり - ref. [Back up and restore — PlanetScale Documentation](https://planetscale.com/docs/concepts/back-up-and-restore)
    - Hobby プランの場合は毎日 1 回
  - Neon 同様ブランチ機能あり - ref. [Branching workflow](https://planetscale.com/docs/concepts/branching)
  - [Non-blocking schema changes](https://planetscale.com/docs/concepts/what-is-planetscale#non-blocking-schema-changes)
    - 上記を組み合わせてバックアップからブランチを切るということも可能。
  - その他にも "ノンブロッキングスキーマ変更", "スキーマ変更の revert", クエリパフォーマンス分析ダッシュボードツールの "Planetscale Insights" など便利な機能がいろいろありそう。- ref. [PlanetScale features — PlanetScale Documentation](https://planetscale.com/docs/concepts/what-is-planetscale#planetscale-features)
- 注意点
  - 外部キー制約をサポートしていない
    - 外部キー制約はオンライン DDL 操作を妨害するのと、外部キー制約を付けなかった際に得られるノンブロッキングスキーマ変更やシャーディングなどによりメリットの方が大きいと判断しているため。- ref. [Operating without foreign key constraints — PlanetScale Documentation](https://planetscale.com/docs/learn/operating-without-foreign-key-constraints)

#### 参考記事、関連サイト

https://qiita.com/tak001/items/cfbaa9dcb542929ff235

https://zenn.dev/tak_iwamoto/articles/b27151d22d9e6a

https://zenn.dev/catnose99/articles/f8a90a1616dfb3#planetscale

## Render.com

Render.com は多様なインフラサービスを提供しており、その中で PostgreSQL も利用可能となっている。他にも Redis も提供しているが、この記事では割愛する。

https://render.com/docs/databases

- 料金
  - $0 for first 90 days
    - free プランの場合、DB 作成後 90 日でアクセスできなくなる。その後 14 日以内にアップグレードしないと削除される。 - ref. [90-day limit \| Render Docs](https://render.com/docs/free#90-day-limit)
- ストレージ容量
  - SSD 1GB
- スペック
  - CPU: 0.1
  - メモリ: 256MB
- コネクション数
  - 97
- リージョン
  - [Regions \| Render Docs](https://render.com/docs/regions)
- その他提供されている機能
  - バックアップ - ref.
    - 無料のプランの場合はバックアップされない。有料のインスタンスタイプにアップグレードすると、毎日の自動バックアップと手動バックアップが利用可能。
  - IP でのアクセス制御 - ref. [Access Control \| Render Docs](https://render.com/docs/databases#access-control)
  - CPU やメモリなどの代表的なメトリクスを見れるダッシュボード - ref. [Metrics \| Render Docs](https://render.com/docs/databases#metrics)
  - 使用できる PostgreSQL のバージョン - ref. [Database Versions & Upgrades \| Render Docs](https://render.com/docs/databases#database-versions--upgrades)
    - 11, 12, 13, 14, 15 が使用可能で DB 作成時に選択できる。

#### 参考記事、関連サイト

https://qiita.com/mycndev/items/fc7a8fecd7d0b0d09828

## Supabase

BaaS として最も勢いのあるサービスの一つで、DB だけでなく認証やリアルタイムリスナー、ストレージなど幅広く提供している。

https://supabase.com/

- 料金
  - Free プランあり
  - 2 Organization まで作成可能
- DB ストレージ容量
  - 500MB
- リージョン
  - 東京リージョンあり。またAWS クラウド上の[これら](https://supabase.com/docs/guides/functions/regional-invocation#available-regions)のリージョンを使用可能。
- その他提供されている機能や情報
  - Row Level Security が使える - ref. [Row Level Security \| Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
  - ブラウザから Table view としてテーブルの中身などを確認できる。その他にも CSV やスプレッドシートからインポートできる。
  - [@supabase/supabase-js](https://github.com/supabase/supabase-js) や [Supabase CLI](https://github.com/supabase/cli) など公式が提供していて開発のライフサイクル全般で見ても手厚い。
- 注意点
  - 1 週間の間、アクティビティや API リクエストがなければ停止。（解除はダッシュボードから）
  - 自動バックアップなし

#### 参考記事、関連サイト

https://qiita.com/kabochapo/items/6a2a391832825d17af7d

https://zenn.dev/chot/articles/ddd2844ad3ae61

https://github.com/supabase/supabase

## Vercel Postgres

Vercel 社が提供している Vercel Storage の 1 つである Vercel Postgres は、マネージドでサーバーレスな PostgreSQL。

https://vercel.com/docs/storage/vercel-postgres

- 料金
  - 無料の Hobby プランあり
  - 1 つの DB を作成可能
- ストレージ容量
  - トータル 256MB
- スペック
  - 60 hours/month のコンピュートリソース
    - 0.25 の論理CPU
  - write 256MB/month
  - データ転送量 256MB/month
- リージョン
  - 日本リージョンはない。一番近くてシンガポール。- ref. [Vercel Postgres region list \| Vercel Docs](https://vercel.com/docs/storage/vercel-postgres/limits#vercel-postgres-region-list)
- その他提供されている機能
  - JS 用の SDK がある
    - [@vercel/postgres](https://github.com/vercel/storage/tree/main/packages/postgres)
  - 使用できる PostgreSQL のバージョン - ref. [Vercel Postgres \| Vercel Docs](https://vercel.com/docs/storage/vercel-postgres#how-vercel-postgres-works)
    - 15
- 注意点
  - DB はリクエストを受信してから 5 分間はアクティブで、その後 5 分間アイドル状態になると、停止状態になる。次にアクセスされる際に、最大 1 秒間のコールドスタートが発生
  - 利用限度額に近づくと Vercel からメールを届く。追加の使用料を支払う必要はないが、制限を超えると Vercel Postgres にアクセスできなくなる。この場合、30 日経過すると再度利用できる。

#### 参考記事、関連サイト

https://vercel.com/guides/nextjs-prisma-postgres

https://qiita.com/tomohiko_ohhashi/items/da804ed1f5870c9ce52d

## 候補に上がらなかったサービス

今回は候補に上がらなかったサービスではあるが、場合によっては検討の余地ありかなと言うものをリストアップしておく。

#### Cloudflare D1

Cloudflare の CDN のエッジロケーション上で動く Cloudflare のエッジ DB サービス。実体としてはエッジに分散された SQLite。

https://www.cloudflare.com/ja-jp/developer-platform/d1/

現時点ではまだベータ版ということで候補としてピックアップしなかったが、情報を追いつつ正式リリースされた時点でもう少し詳しく調べてみようと思う。

#### Heroku Postgres

多くの個人開発者がお世話になっているであろう、Heroku が提供しているマネージド PostgreSQL。

https://jp.heroku.com/postgres

昨年、[無料枠廃止のアナウンスがされた](https://blog.heroku.com/next-chapter)ため、今回は候補に上がらなかった。

## まとめ

比較するにあたって、他にもいろんな観点あるかなと思うが、一応全部見渡すとこんな感じになった。

| サービス       | DBMS       | 無料枠のストレージ | 国内リージョン |
| -------------- | ---------- | ------------------ | -------------- |
| Neon           | PostgreSQL | 3GB                | ×              |
| Planetscale    | MySQL      | 5GB                | ○              |
| Render.com     | PostgreSQL | 1GB                | ×              |
| Supabase       | PostgreSQL | 500 MG             | ○              |
| Vercel Storage | PostgreSQL | 256MB              | ×              |

この記事では、個人開発において無料で利用できる RDB サービスの選択肢をまとめてみた。各サービスは、それぞれ独自の価格体系、スペック、および機能を持つので、技術選定に際してこれらの情報を吟味し、かつ最新の情報をチェックし、最適な DB サービスを選択しようと思う。

今回は取り上げていないものの RDB 以外に Google Cloud の Cloud Firestore や AWS の DynamoDB など NoSQL も忘れずに検討したい。

## 参考

https://laiso.hatenablog.com/entry/nope-sql/

https://zenn.dev/kazu777/articles/7b01cb8cec08fb

https://zenn.dev/imah/articles/a41e889dbf54da

https://qiita.com/takiguchi-yu/items/020e17151903011d92f6

https://blog.rmblankslash.net/entry/2022/08/22/080000

https://github.com/neondatabase/neon

https://planetscale.com/
