---
title: Docker Compose V2 が GA された
date: "2022-05-14"
tags: ["Docker", "Docker Compose", "Container"]
draft: false
summary: Docker Compose V2 が GA されたので何が変わったのか簡単にまとめてみた
---

## はじめに

ちょっと前の話になるのだが、Docker Compose V2 が GA となったのでアップデートの内容などを簡単にまとめておく。

[Announcing Compose V2 General Availability \- Docker](https://www.docker.com/blog/announcing-compose-v2-general-availability/)

これまで Docker CLI からは独立（別途インストールも必要だった）していた Docker Compose V1 は、V2 で正式に Docker CLI Plugin となった。

Docker CLI plugin とは、Docker CLI にプラグインとしてサブコマンドを追加できる機能で、下記でプラグインの一覧を確認できる。[^1]

```sh
$ ls -1 /usr/local/lib/docker/cli-plugins/* | grep compose
/usr/local/lib/docker/cli-plugins/docker-compose
```

## 使用者側への影響

Docker Desktop v3.4 以上を使っている場合は、自動で Compose V2 がインストールされ、特に開発者側でセットアップすることはない。
また、Docker Desktop v4.4.2 以降を使用している場合ではデフォルトで `docker-compose` から `docker compose` コマンドへのエイリアスが適用される。今まで通り `docker-compose` も使用できるので、既存のスクリプトへの影響はなさそうなので安心だ。

Docker Desktop の設定画面の下記の部分で設定を自由に切り替えできる。

![Preference on Docker Desktop](https://i.imgur.com/YcXEaDC.webp)

## Docker Compose V2 でのアップデート

公式のアナウンスにある 5 つの項目について 1 つずつ見ていこうと思う。

### 1) Fast Delivery of New Features Within the Docker CLI

- GPU アクセスをサポート
  - [Enabling GPU access with Compose \| Docker Documentation](https://docs.docker.com/compose/gpu-support/)
- Profiles 機能のサポート
  - [Using profiles with Compose \| Docker Documentation](https://docs.docker.com/compose/profiles/)
  - Docker Compose で動作する複数のコンテナ群を profiles というプロパティでカテゴリ分けする機能。
- サブコマンド
  - `docker compose ls`
  - `docker compose cp`

### 2) Seamless Path to Production

Cloud Integuration という機能により AWS や Azure といったクラウドプラットフォームへのデプロイが可能となった。まだ手元で確認したわけではないが、Context を切り替えて `docker compose up` するだけでデプロイできるといったイメージだろう。

現在は Amazon Elastic Container Service(ECS) と Microsoft Azure Container Instances(ACI) に対応しているとのこと。

```sh
# 簡単にイメージだけを示すとこんな感じ
$ docker context create ecs my-ecs

$ docker context use my-ecs

$ docker compose up
```

実際にどういう挙動になるのかは今後試してみたい。試してみたい方は [こちら](https://github.com/docker/compose-cli) にチュートリアルがあったので参考にして欲しい。

### 3) Creating a Homogenous Docker Ecosystem in Go

Compose V1 は Python で書かれていたのが V2 では Go で書き直された。

Docker 自体は Go で書かれているため今回の変更でより全体への統合がしやすくなったようだ。使用する側からは普段あまり意識することはないが、新しい変更が Docker エコシステムで共有しやすくなり結果としてリリースのスピードが上がったのではないだろうか。

また公式のアナウンスから引用すると、`docker run` と `docker compose run` や `docker exec` と `docker compose exec` などのコマンドのコードを共通化できたとのこと。

### 4) Easier Update-and-Dependency Management with Compose Binaries

Python 製の Compose V1 ではできなかったバイナリの配布が Go で書き直されたことで V2 では可能になった。クロスコンパイルが容易なのも Go の強みだと改めて実感させられる。

### 5. Run Commands Without a Compose File

`--project-name` は `docker compose start/stop/down/exec` などを `docker-compose.yaml` をカレントディレクトリに置いたり、プロジェクトのディレクトリに移動したりせずに `docker compose` コマンドを使用できるようになった。

## まとめ

Docker Compose V2 が GA されたのでアップデート内容を簡単にまとめてみた。

Cloud Integuration や Profiles など便利な機能については今後試してみようと思う。また、次に Docker Compose を利用する際は `--project-name` オプションを使用する前提でプロジェクトのディレクトリ構成も再度見直して見てもいいかも知れない。

## 参考

https://www.docker.com/blog/announcing-compose-v2-general-availability/

https://github.com/docker/compose-cli

https://zenn.dev/miroha/articles/docker-cli-plugin

https://zenn.dev/skanehira/articles/2021-06-03-new-docker-compose

[^1]: [こちら](https://zenn.dev/skanehira/articles/2021-06-03-new-docker-compose) の記事を参考にさせていただいた。記事でも述べられているが調べてもあまり情報が見るからなかった。
