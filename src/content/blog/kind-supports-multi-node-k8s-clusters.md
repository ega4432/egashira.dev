---
title: kind を使ってローカルにマルチノードな Kubernetes クラスタを構築する
date: "2022-05-21"
tags: ["k8s", "Docker", "Container", "kind"]
draft: false
summary: "k8s クラスタをローカルに作成できる kind を触ってみた"
---

## はじめに

ローカルで Kubernetes(以下 k8s)クラスタ構築できる [kind](https://kind.sigs.k8s.io/) を使ってみたのでメモとして残しておく。

kind は、**マルチノードなクラスタ構成にも対応**しているのがホットなポイントだと思う。

> kind is a tool for running local Kubernetes clusters using Docker container “nodes”.
> kind was primarily designed for testing Kubernetes itself, but may be used for local development or CI. ref: https://kind.sigs.k8s.io/

k8s を触っていると複数ノードが必要な Taint/Toleration や Affinity の挙動を確認したいことがある。そういう場合に必ずしも検証用のクラスタが手元にある訳ではないので、ローカルでサクッと試せると便利だと思い使ってみることにした。

## 使用した環境

以下の環境で行った。

- macOS Monterey v12.2.1
- Homebrew v3.4.11
- Docker Desktop for Mac v4.8.1
- kubectl v1.22.1
- kind v0.14.0

## kind のインストール

公式ドキュメントを参考に macOS へインストールしていく。ドキュメントの [Installation](https://kind.sigs.k8s.io/docs/user/quick-start#installation) を見ると、いくつか方法が書いてある。

- Homebrew や choco などのパッケージマネージャでのインストール
- バイナリからインストール
- Go のソースを go install / ge get によるインストール
  - Go v1.16 以上が必要

僕は Homebrew でインストールしたので、その方法を記載する。もし、違う方法でやりたい場合は公式のドキュメントを参照して欲しい。

```shell
$ brew install kind

$ kind version
kind v0.14.0 go1.18.2 darwin/amd64
```

## Docker Desktop の設定を変更

クラスタを作る前に、[kind – Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/#settings-for-docker-desktop) を参考に Docker Desktop をリソース制限を緩和しておく。

`a minimum of 6GB of RAM` ともあるが、`8GB is recommended` らしいので、今回はこれに従って設定を変更し、Apply & Restart を押して再起動する。

![Settings for Docker Desktop](https://i.imgur.com/9bjgD3e.webp)

## クラスタの作成

準備ができたので早速クラスタを作成していく。

手順については [Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/) を参考にしているので、詳しく知りたい方はこちらを是非参照してもらいたい。

`kind create cluster` コマンドでクラスタを作成していく。

```shell
# 最初は何もない
$ kind get clusters
No kind clusters found.

# 作成
$ kind create cluster
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.24.0) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
```

`kind create cluster` コマンドを実行したら、クラスタが作成された。流れてくるログを見つつ気づいたこと書くと…

- `kind create cluster`
  - `--name` オプションでクラスタ名を指定できる（デフォルトは `kind` になる）。
  - `--image` オプションでクラスタに使用する Docker イメージ名を指定できる（デフォルトだと `kindest/node` が使用される）
- Context が自動でセットされる。

```shell
# クラスタ一覧を取得
$ kind get clusters
kind

# クラスタ情報を確認
$ kubectl cluster-info --context kind-kind
Kubernetes control plane is running at https://127.0.0.1:52709
CoreDNS is running at https://127.0.0.1:52709/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.

# 自動で Context がセットされている
$ kubectl config current-context
kind-kind

# k8s ノードももちろん作成されている
$ kubectl get nodes
NAME                 STATUS   ROLES           AGE   VERSION
kind-control-plane   Ready    control-plane   23m   v1.24.0

# クラスタとして動いている Docker コンテナ
$ docker ps
CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS          PORTS                       NAMES
366aef6b5984   kindest/node:v1.24.0   "/usr/local/bin/entr…"   13 minutes ago   Up 13 minutes   127.0.0.1:52709->6443/tcp   kind-control-plane
```

## クラスタの削除

`--name` オプションでクラスタ名を指定して任意のクラスタを削除できる。ちなみに指定しない場合は、デフォルトの `kind` という名前のクラスタを削除しにいくようだ[^1]。

```shell
$ kind delete cluster --name kind
Deleting cluster "kind" ...

$ kind get clusters
No kind clusters found.
```

## マルチノードクラスタの作成

今回は、コントロールプレーンと 2 つのワーカーノードから成る合計 3 つのマルチノードクラスタを作成する。

YAML にクラスタの情報を定義できるためついでに試してみた。YAML ファイルを使って、クラスタを作成する場合は `kind create cluster` コマンドに `--config` オプションとしてファイルパスを渡してあげることで対応できる。

```shell
$ cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
EOF

$ kind create cluster --config ./kind-config.yaml
```

```shell
$ kind get clusters
kind

$ kubectl get nodes
NAME                 STATUS     ROLES           AGE   VERSION
kind-control-plane   Ready      control-plane   57s   v1.24.0
kind-worker          Ready      <none>          33s   v1.24.0
kind-worker2         Ready      <none>          33s   v1.24.0
```

期待通り 3 つのノードで構成される k8s クラスタが作成できた！

## まとめ

k8s クラスタをローカルに作成できる kind を触ってみた。kind を使うとカジュアルにマルチノードなクラスタをローカルに構築できるので非常に便利だと思うので、いろいろと遊んでみたい。

ちなみに、書籍「[Kubernetes 完全ガイド 第 2 版](https://www.amazon.co.jp/dp/B08FZX8PYW)」で紹介されていたことが、kind を知るきっかけだった。もし読んだことない方は是非こちらも手にとって見るといいと思う。

[^1]:
    > If the flag --name is not specified, kind will use the default cluster context name kind and delete that cluster. ref: https://kind.sigs.k8s.io/docs/user/quick-start/#deleting-a-cluster
