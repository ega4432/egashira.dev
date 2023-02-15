---
title: kind で構築した Kubernetes クラスタ内の NodePort にローカルから接続する
date: "2022-06-05"
tags: ["k8s", "kind", "Container", "Docker"]
draft: false
summary: "kind で NodePort を使って外部からアクセスしたい場合の extraPortMapping の使い方のメモ"
---

## はじめに

タイトル通り [kind](https://kind.sigs.k8s.io) で構築した Kubernetes(以下 k8s)クラスタで遊んでいたら、「あれ？NodePort にアクセスできない！」となったのでそれについて書く。

ちなみに以前 macOS に kind のセットアップ手順についてもブログにまとめたので、そちらも参照して欲しい。

[kind を使ってローカルにマルチノードな Kubernetes クラスタを構築する](https://egashira.dev/blog/kind-supports-multi-node-k8s-clusters)

## 使用した環境

以下の環境で行った。

- macOS Monterey v12.2.1
- Homebrew v3.4.11
- Docker Desktop for Mac v4.8.1
- kubectl v1.22.1
- kind v0.14.0

## 原因

kind は、Docker コンテナ上で動作し k8s クラスタとして振る舞うが、ホストマシンからルーティング可能な IP アドレスが kind の Docker コンテナに振られないため。このように Docker Desktop for Mac にはネットワークにいくつかの制限があり、ユーザから見えないようになっているものもある。

[Networking features in Docker Desktop for Mac \| Docker Documentation](https://docs.docker.com/desktop/mac/networking/)

## 解決策

読んでなかっただけで対象方法は公式ドキュメントでちゃんと言及してあった。

[Extra Port Mappings 🔗︎](https://kind.sigs.k8s.io/docs/user/configuration/#extra-port-mappings)

ホストマシンが Linux の場合は、これを利用する必要はないが、Docker Desktop を利用している macOS, windows では同じ対処方法で解決できそうだ。

### kind クラスタの設定

以下は公式ドキュメントに従ってクラスタの設定をした後、立ち上げていく。

```yaml:kind-portmapping-config.yaml showLineNumbers
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
    - containerPort: 30599
      hostPort: 8080
  - role: worker
```

勘違いしそうになるが 6 行目の `containerPort` は、kind がノードとして振る舞う Docker コンテナのポートと言う意味で、すなわちこれは k8s クラスタの NodePort を意味する。そのため NodePort のルールに従い 30000 - 32767 番のポートを割り当てる必要があるため、この範囲の任意の数字にする。

```shell
$ kind create cluster --name port-mapping-cluster --config ./kind-portmapping-config.yaml
Creating cluster "port-mapping-cluster" ...
 ✓ Ensuring node image (kindest/node:v1.24.0) 🖼
 ✓ Preparing nodes 📦 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
 ✓ Joining worker nodes 🚜
Set kubectl context to "kind-port-mapping-cluster"
You can now use your cluster with:

kubectl cluster-info --context kind-port-mapping-cluster

Have a nice day! 👋

# kind クラスタの確認
$ kind get clusters
port-mapping-cluster

# k8s ノードの確認
$ kubectl get nodes
NAME                                 STATUS   ROLES           AGE   VERSION
port-mapping-cluster-control-plane   Ready    control-plane   76s   v1.24.0
port-mapping-cluster-worker          Ready    <none>          38s   v1.24.0
```

ここまででクラスタの作成ができた。

### Pod をデプロイ

続いて作成したクラスタに Pod をデプロイしていくが、今回は Deployment で 3 つの Pod を作成した。

```shell
$ kubectl create deploy my-app \
    --image=nginx \
    --replicas=3 \
    --port=80
deployment.apps/my-app created

$ kubectl get pod -o wide
NAME                      READY   STATUS    RESTARTS   AGE   IP           NODE                          NOMINATED NODE   READINESS GATES
my-app-6ddcb74989-rdl8s   1/1     Running   0          37s   10.244.1.3   port-mapping-cluster-worker   <none>           <none>
my-app-6ddcb74989-vbdq6   1/1     Running   0          37s   10.244.1.4   port-mapping-cluster-worker   <none>           <none>
my-app-6ddcb74989-wvbcr   1/1     Running   0          37s   10.244.1.2   port-mapping-cluster-worker   <none>           <none>
```

### Pod を NodePort で公開する

作成した Pod を NodePort タイプでクラスタ外に公開し、ホストマシンからアクセスできるか確認する。

```shell
$ cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  labels:
    app: my-app
  name: my-svc
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 80
    nodePort: 30599
  selector:
    app: my-app
  type: NodePort
EOF
service/my-svc created

$ kubectl get svc | grep -v kubernetes
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
my-svc       NodePort    10.96.232.252   <none>        80:30599/TCP   11s
```

ポイントは、kind でクラスタを作成した際の `containerPoer` と同じポート番号を `nodePort` にも指定しているところだ。その点については、公式ドキュメントにも下記のように記載がある。

> To use port mappings with NodePort, the kind node containerPort and the service nodePort needs to be equal.

## ホスト側からアクセス

ここまでで検証するためのリソースの作成ができたので curl を実行してみると…

```shell
$ curl -I 0.0.0.0:8080
HTTP/1.1 200 OK
Server: nginx/1.21.6
Date: Thu, 02 Jun 2022 12:54:44 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Tue, 25 Jan 2022 15:03:52 GMT
Connection: keep-alive
ETag: "61f01158-267"
Accept-Ranges: bytes
```

無事に 200 がレスポンスと返ってきた！
ブラウザで開いても Nginx の初期画面が表示されアクセスできていることを確認できた！

## おまけ

kind ノードとして動作している Docker コンテナを見ると、ホスト側の 8080 番ポートがコンテナ内の 30599 番ポートにマッピングされているのが分かった。

```shell
$ docker ps
CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS          PORTS                                                NAMES
824855c064c4   kindest/node:v1.24.0   "/usr/local/bin/entr…"   40 minutes ago   Up 40 minutes   127.0.0.1:54456->6443/tcp, 0.0.0.0:8080->30599/tcp   port-mapping-cluster-control-plane
f034c6a04e7e   kindest/node:v1.24.0   "/usr/local/bin/entr…"   40 minutes ago   Up 40 minutes                                                        port-mapping-cluster-worker

$ docker inspect 824855c064c4 --format="{{ json .HostConfig.PortBindings }}" | jq .
{
  "30599/tcp": [
    {
      "HostIp": "0.0.0.0",
      "HostPort": "8080"
    }
  ],
  "6443/tcp": [
    {
      "HostIp": "127.0.0.1",
      "HostPort": "54456"
    }
  ]
}
```

## まとめ

kind で作った k8s クラスタを外部に公開したい場合は、extraPortMapping を使って公開してあげれば良い。

## 参考

https://kind.sigs.k8s.io/docs/user/configuration/#extra-port-mappings

https://docs.docker.com/desktop/mac/networking/

https://stackoverflow.com/questions/62432961/how-to-use-nodeport-with-kind
