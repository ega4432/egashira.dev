---
title: kind で特定の Kubernetes のバージョンを指定してクラスタを構築する
date: "2022-12-24"
tags: ["kind", "k8s"]
draft: false
summary: 最新のバージョンを使用したり、特定のバージョンでクラスタを構築したりする際に調べた
---

## はじめに

kind でクラスタを構築する際に、特定の Kubernetes（以下 k8s）バージョンをどうやって指定できるかを調べたのでメモとして残しておく。

## 結論

特定のバージョンを指定する場合、設定ファイルにイメージのバージョンを指定すれば実現できる。対応するイメージのバージョンについては、kind の GitHub release ページより確認できる。

https://github.com/kubernetes-sigs/kind/releases

kind のバージョンによって使用できる k8s のバージョンが決まっていて、例えば最新の kind v0.17.0 で v1.26 が追加された。また公式ドキュメントは以下を参照いただければと思う。

https://kind.sigs.k8s.io/docs/user/configuration/#kubernetes-version

詳しくは以下に手順を記載する。

## 事前準備

kind CLI は Homebrew でインストールした。まだインストールできていなければ `brew install kind` を実行すれば良い。念の為最新にアップグレードしておく。今回の作業については 2022 年 12 月現在での最新バージョンを使用している。

```sh
$ brew list | grep kind
kind

$ brew upgrade kind

$ kind version
kind v0.17.0 go1.19.3 darwin/amd64
```

## 特に指定せずにクラスタを構築する

kind では CLI の `kind create cluster` コマンドでクラスタを構築できる。

```sh
$ kind create cluster --name=simple
Creating cluster "simple" ...
 ✓ Ensuring node image (kindest/node:v1.25.3) 🖼  # <---- ☆
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-simple"
You can now use your cluster with:

kubectl cluster-info --context kind-simple

Not sure what to do next? 😅  Check out https://kind.sigs.k8s.io/docs/user/quick-start/
```

特に指定しない場合は上記のログにも出ている通り、v1.25.3 のイメージが使用される。kubectl コマンドでも確認するとそのバージョンと一致していることが分かる。

```sh
$ kubectl version --short
Flag --short has been deprecated, and will be removed in the future. The --short output will become the default.
Client Version: v1.26.0
Kustomize Version: v4.5.4
Server Version: v1.25.3  # <---- ☆

# この方法でも確認可能
$ kubectl get nodes
NAME                   STATUS   ROLES           AGE   VERSION
simple-control-plane   Ready    control-plane   13m   v1.25.3  # <---- ☆
```

## 特定のバージョンを指定して構築する

次に以下のような設定ファイルを用意してクラスタの構築する。

k8s のバージョンを指定する場合は、設定ファイルの `nodes.[*].image` プロパティに使用したいイメージをセットすることで実現できる。

「image」が何を示すかというと、kind は Docker コンテナ 1 つをノード 1 つとして振る舞うことで k8s クラスタを構築するため、そのノードのイメージを指定するということだと思う。

今回は確認のため、control-plane ノードのイメージを指定して、worker ノードには設定しないという内容で行ってみた。

```yaml:config.yaml showLineNumbers
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    image: kindest/node:v1.26.0@sha256:691e24bd2417609db7e589e1a479b902d2e209892a10ce375fab60a8407c7352
  - role: worker
```

通常 `docker pull` コマンドだったり、Dockerfile の `FROM`　句では、レポジトリとタグを指定するが、この場合ダイジェストを指定するらしい。余談だが、上記の通常の場合だと最新バージョンを取得するのに対してダイジェスト値を使用することで、特定のバージョンをねらい打ちできる。

`kind create cluster` コマンドを実行する際、上記の設定ファイルを `--config` オプションで指定する。

```sh
$ kind create cluster --config=./config.yaml --name=custom
Creating cluster "custom" ...
 ✓ Ensuring node image (kindest/node:v1.25.3) 🖼
 ✓ Ensuring node image (kindest/node:v1.26.0) 🖼  # <---- ☆
 ✓ Preparing nodes 📦 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
 ✓ Joining worker nodes 🚜
Set kubectl context to "kind-custom"
You can now use your cluster with:

kubectl cluster-info --context kind-custom

Have a nice day! 👋
```

ログにも v1.26.0 のイメージが使われていることが分かる。また、先程と同様に kubectl コマンドでも確認してみる。

```sh
$ kubectl version --short
Flag --short has been deprecated, and will be removed in the future. The --short output will become the default.
Client Version: v1.26.0
Kustomize Version: v4.5.7
Server Version: v1.26.0  # <---- ☆

$ kubectl get nodes
NAME                   STATUS   ROLES           AGE   VERSION
custom-control-plane   Ready    control-plane   97s   v1.26.0  # <---- ☆
custom-worker          Ready    <none>          58s   v1.25.3
```

結果、control-plane ノードは v1.26.0、worker ノードはデフォルトの v1.25.3 で構成されていることが分かった。

## まとめ

kind で特定のバージョンのクラスタをローカルでサクッと構築できる方法について紹介した。これができればクラスとのバージョンアップや新機能を使うのに敷居が下がるのではと思うので活用していきたい。

## 参考

https://kind.sigs.k8s.io/

https://github.com/kubernetes-sigs/kind

https://hub.docker.com/r/kindest/node
