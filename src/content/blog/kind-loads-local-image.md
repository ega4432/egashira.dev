---
title: kind でローカルのコンテナイメージを利用する場合の注意点
date: "2022-11-08"
tags: ["k8s", "Container", "kind"]
draft: false
summary: ErrImageNeverPull になってハマったのでメモ
---

## はじめに

kind の k8s クラスタでローカルのコンテナイメージを使用したい場合、軽くハマったので残しておく。

## 起きた事象

今回使った k8s クラスタは、kind で素の状態で構築した。

```sh
$ kind create cluster --name=alice
Creating cluster "alice" ...
 ✓ Ensuring node image (kindest/node:v1.24.0) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-alice"
You can now use your cluster with:

kubectl cluster-info --context kind-alice

Thanks for using kind! 😊

$ kind get clusters
alice

$ kubectl get all
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   3m38s
```

そして、ローカルに存在する `nginx:1.23.1` イメージを使って（`imagePullPolicy: Never`）Pod の作成を試みた。

```sh
$ cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: nginx
  name: nginx
spec:
  containers:
    - image: nginx:1.23.1
      imagePullPolicy: Never
      name: nginx
  dnsPolicy: ClusterFirst
  restartPolicy: Always
EOF
pod/nginx created
```

Pod の状態を確認すると以下のようにエラーになって起動していなかった。`imagePullPolicy: Never` にしているのに、なぜかレジストリから pull しようとしている。

```sh
$ kubectl  get pods -w
NAME    READY   STATUS              RESTARTS   AGE
nginx   0/1     ErrImageNeverPull   0          8s

$ kubectl describe pod nginx| grep -A10 -i events:
Events:
  Type     Reason             Age               From               Message
  ----     ------             ----              ----               -------
  Normal   Scheduled          21s               default-scheduler  Successfully assigned default/nginx to alice-control-plane
  Warning  ErrImageNeverPull  8s (x3 over 20s)  kubelet            Container image "nginx:1.23.1" is not present with pull policy of Never
  Warning  Failed             8s (x3 over 20s)  kubelet            Error: ErrImageNeverPull
```

コンテナイメージ一覧を見ても、指定したイメージは存在しているようだったのでパット見原因が分からなかった。

```sh
$ docker image ls | grep nginx
nginx      1.23.1     2d389e545974   8 weeks ago     142MB
nginx      latest     2b7d6430f78d   2 months ago    142MB
```

## 結論

ローカルのコンテナイメージを使用したい場合は、kind で構築した k8s ノードにロードしておく必要がある！

下記の公式ドキュメントに記載があった。

[Loading an Image Into Your Cluster | kind](https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster)

```sh
$ kind load docker-image nginx:1.23.1 --name=alice
Image: "nginx:1.23.1" with ID "sha256:2d389e545974d4a93ebdef09b650753a55f72d1ab4518d17a30c0e1b3e297444" not yet present on node "alice-control-plane", loading...
```

kind クラスタのマスターノードコンテナ上のイメージを確認すると追加されていた。

```sh
$ docker container ls
CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS          PORTS                       NAMES
080e2d285dfa   kindest/node:v1.24.0   "/usr/local/bin/entr…"   34 minutes ago   Up 34 minutes   127.0.0.1:60598->6443/tcp   alice-control-plane

# "alice-control-plane" の部分は kind のコンテナ名を指定（`docker container ls` で調べる）
$ docker exec -it alice-control-plane crictl images  | grep nginx
docker.io/library/nginx                    1.23.1               2d389e545974d       146MB
```

Pod も正常に起動できていた！

```sh
$ kubectl get pods
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          18m
```

## まとめ

kind の k8s クラスタでローカルのコンテナイメージを使用（`imagePullPolicy: Never`）したい場合は、事前にロードしておこう！
`imagePullPolicy: IfNotPresent` の場合も同様。

## 参考

https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster
