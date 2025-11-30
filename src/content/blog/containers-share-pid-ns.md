---
title: "コンテナで PID Namespace を共有する"
date: "2024-10-31"
tags: ["Linux", "Container", "Security", "Docker"]
draft: false
summary: "Linux カーネルの Namespace の一つである PID Namespace について実際にコンテナでどのように隔離・共有されるのか挙動を見てみた際のメモ"
---

## はじめに

コンテナ仮想化技術では、Linux カーネルのリソースを隔離するため Namespace という機能を使っている。
その中の一つである PID Namespace について実際に動かしてみて挙動を見てみたのでメモとしてまとめてみた。

## 前提

今回使用している環境は以下の通りである。

- ホストマシン：macOS Sonoma 14.4.1
- コンテナツール：Rancher Desktop v1.12.3

PID, PID Namespace について最初に簡単に触れておく。
PID は 1 から始まり、新しいプロセスが実行される度にその整数がインクリメントされて付与される。
原則として同じ PID を持ったプロセスが複数立ち上がることはない。

コンテナでは、ホストとは隔離された PID Namespace が作られる。
つまり、コンテナ内で新しくプロセスが立ち上がる際は、PID 1 から新たに 割り当てられる。

## 通常の挙動

まずは、コンテナでは通常 PID Namespace がどのように隔離されているか確認していく。その検証のため 2 つのコンテナを立ち上げる。

イメージは `nginx:alpine` を使い、それぞれ `app1`, `app2` と便宜上コンテナ名を付けて起動する。

```sh
$ docker run -it --rm --name app1 -d nginx:alpine sleep 1d
d5a3ec663cd00181157c1d1234420a16f7cbce763fd89b33334ace582a34555d

$ docker run -it --rm --name app2 -d nginx:alpine sleep 1d
9b7e5c623c117e0472bcd073a47c59f23319b35f664778ce837e1bdfc5b77b91
```

起動できているか確認して、それぞれのコンテナで PID がどうなっているかも確認する。

```sh
# コンテナの起動可否を確認
$ docker ps
CONTAINER ID   IMAGE          COMMAND                   CREATED              STATUS              PORTS     NAMES
9b7e5c623c11   nginx:alpine   "/docker-entrypoint.…"   About a minute ago   Up About a minute   80/tcp    app2
d5a3ec663cd0   nginx:alpine   "/docker-entrypoint.…"   About a minute ago   Up About a minute   80/tcp    app1

# app1, app2 各コンテナのプロセスを確認
$ docker exec -it app1 ps aux
PID   USER     TIME  COMMAND
    1 root      0:00 sleep 1d
   19 root      0:00 ps aux

$ docker exec -it app2 ps aux
PID   USER     TIME  COMMAND
    1 root      0:00 sleep 1d
    7 root      0:00 ps aux
```

上記のことからコンテナ 2 つはどちらも PID 1 で sleep コマンドを実行しており、これはつまりホストと、それぞれのコンテナ間とも隔離された PID Namespace になっていることが確認できる。

一方で、コンテナを起動する際に既存の PID Namespace を共有することもできる。その方法としては、`docker run` コマンドで `--pid` オプションを使って起動する方法で

- `--pid=host`: ホストと PID Namespace を共有
- `--pid=container:<CONTAINER_ID|CONTAINER_NAME>`: 任意のコンテナと PID Namespace を共有

の 2 パターンがある。それら 2 パターンについてやってみる。

## `docker run --pid=host` の挙動

まずは、ホストと PID Namespace を共有する方を見ていきたい。

```sh
$ docker run -it --rm --name app3 -d --pid=host nginx:alpine
e9cacbf790d055b01d415cb03106897d8458a04d44becce7d4abb6e17a03e6a9

$ docker exec -it app3 ps aux | grep nginx
30106 root      0:00 nginx: master process nginx -g daemon off;
30161 nginx     0:00 nginx: worker process
30162 nginx     0:00 nginx: worker process
30163 nginx     0:00 nginx: worker process
30164 nginx     0:00 nginx: worker process
```

上記では `docker run --pid=host` で `app3` コンテナを起動した。
そして、`docker exec` コマンドを使ってコンテナ内のプロセスを参照しているが、このコンテナはホストの PID Namespace を共有しているため、grep で nginx のプロセスに絞り込んでいる（grep しないと非常に多くのプロセスが表示されるはず）。

また、プロセスの一覧を見ても分かる通り、通常であれば PID 1 で起動しているはずが、PID 30106[^1] で起動しており、ホストの PID Namespace を共有していることが分かる。

これはセキュリティ的に非常に危険な状態で、ホスト側から `kill -9 30106` などするとコンテナを止めることもできたり、`docker exec -it app3 ps aux` とするとホスト側のプロセスが見えてしまったりする。

## `docker run --pid=container:<CONTAINER_ID|CONTAINER_NAME>` の挙動

続いて既存のコンテナと PID Namespace を共有する方を見ていく。

```sh
# ここで app1 コンテナを指定する
$ docker run --rm -it -d --name app4 --pid=container:app1 nginx:alpine
311460a5803cf044756e75b4a370431d98dc8d2245b1bfef2360e3ea2115ac80

$ docker exec -it app4 ps aux
PID   USER     TIME  COMMAND
    1 root      0:00 sleep 1d
  111 root      0:00 nginx: master process nginx -g daemon off;
  140 nginx     0:00 nginx: worker process
  141 nginx     0:00 nginx: worker process
  142 nginx     0:00 nginx: worker process
  143 nginx     0:00 nginx: worker process
  144 root      0:00 ps aux
```

上記では `docker run --pid=container:app1` で `app4` コンテナを起動した。
そして、`docker exec` コマンドを使ってコンテナ内のプロセスを参照しているが、このコンテナは別のコンテナ `app1` の PID Namespace を共有している。

なので、`app1` を立ち上げた際に実行した sleep コマンドが PID 1 で起動しており、今回 `app4` で最初に実行されているプロセスは PID 111 となっている。

このようにコンテナから別の任意のコンテナの PID Namespace を共有するケースとしては、コンテナ内のモニタリングなどで活用できそうではある。

## まとめ

今回は、Linux カーネルの PID Namespace について、特にコンテナでの動作と挙動を紹介した。

PID Namespace は、各コンテナが独立したプロセス空間を持つことでプロセスの隔離を実現し、セキュリティや安定性を向上させる仕組みである。通常、コンテナはホストや他のコンテナとは異なる PID Namespace を持ち、各コンテナ内のプロセスは他の Namespace に影響を与えることはない。

しかし、今回紹介した方法を使えばホストや他のコンテナと PID Namespace を共有することもできる。

これらの方法は特定のユースケースにおいて便利に活用できる反面、セキュリティの問題を引き起こす可能性もあるため、実際に使用する際はリスクとメリットを考慮しながら、慎重に活用したい。

## 参考

https://docs.docker.jp/engine/reference/run.html#pid-pid

https://blog.amedama.jp/entry/linux-pid-Namespace_1

https://kakakakakku.hatenablog.com/entry/2021/07/19/001536

https://qiita.com/hmaruyama/items/ea0da702670b6bffae20

[^1]: `nginx:alpine` イメージはベースイメージが `nginx:alpine-slim` であり、その Dockerfileでは [`CMD ["nginx", "-g", "daemon off;"]`](https://github.com/nginxinc/docker-nginx/blob/6a4c0cb4ac7e53bbbe473df71b61a5bf9f95252f/stable/alpine-slim/Dockerfile#L123) となっているため、これがコンテナの最初のプロセスとなる。
