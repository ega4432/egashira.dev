---
title: Kubernetes の Taint/Toleration について
date: "2023-01-16"
tags: ["k8s", "Container"]
draft: false
summary: 実際に動かしてみたメモ
---

## はじめに

Kubernetes（以下 k8s）には、ノードが特定の Pod を排除する機能である **Taint** というものがある。一方で **Toleration** は Pod に適用され、一致する Taint が付与されているノードにスケジュールされることを許可するものである。このように基本的には Taint と Toleration は対になって機能する。

また、ユースケースとして**ノードを特定のワークロード専用として使用した場合**や**ノードのメンテナンスのため Pod を排除する場合**などに使用される。

本記事では Taint, Toleration それぞれの設定方法やその内容について実際に動かしながら見ていこうと思う。

## 使用するクラスタの準備

クラスタの構築には、[kind](https://kind.sigs.k8s.io/) を使用した。Taint, Toleration を試すには複数ノードが必要になるが、手元でサクッと用意できるため kind を選択した。

kind を使ったマルチノードクラスタの構築、最新バージョンの k8s での構築方法については別の記事を書いているのでそちらを参照いただければと思う。

https://egashira.dev/blog/kind-supports-multi-node-k8s-clusters

https://egashira.dev/blog/kind-uses-specific-k8s-version

まず、クラスタの設定を定義したファイルを作成する。

```yaml title="config.yaml" showLineNumbers
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    image: kindest/node:v1.26.0@sha256:691e24bd2417609db7e589e1a479b902d2e209892a10ce375fab60a8407c7352
  - role: worker
    image: kindest/node:v1.26.0@sha256:691e24bd2417609db7e589e1a479b902d2e209892a10ce375fab60a8407c7352
  - role: worker
    image: kindest/node:v1.26.0@sha256:691e24bd2417609db7e589e1a479b902d2e209892a10ce375fab60a8407c7352
```

そして、下記のコマンドを使うと定義した内容でクラスタが作成される。

```sh
$ kind create cluster --name=alice --config=config.yaml
```

```sh
$ kubectl get nodes -o wide
NAME                  STATUS   ROLES           AGE   VERSION   INTERNAL-IP   EXTERNAL-IP   OS-IMAGE       KERNEL-VERSION      CONTAINER-RUNTIME
alice-control-plane   Ready    control-plane   11m   v1.24.0   172.18.0.4    <none>        Ubuntu 21.10   5.10.124-linuxkit   containerd://1.6.4
alice-worker          Ready    <none>          11m   v1.24.0   172.18.0.3    <none>        Ubuntu 21.10   5.10.124-linuxkit   containerd://1.6.4
alice-worker2         Ready    <none>          11m   v1.24.0   172.18.0.2    <none>        Ubuntu 21.10   5.10.124-linuxkit   containerd://1.6.4
```

## Taint

### ノードに Taint を設定する

Taint の設定には、`kubectl taint` コマンドを使用する（もちろんマニフェストファイルを `kubectl apply -f` しても良い）。確認のため、複数の Taint を付与してみた。

```sh
$ kubectl taint nodes alice-worker key1=xxx:NoSchedule
$ kubectl taint nodes alice-worker key2=yyy:NoExecute
$ kubectl taint nodes alice-worker2 key1=zzz:NoSchedule
```

Taint が付与されたか確認してみる。余談だが、以下の記事にいい感じのコマンドが紹介されていたので真似してみた。

https://kakakakakku.hatenablog.com/entry/2022/05/24/102351

```sh
$ kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
NAME                  TAINTS
alice-control-plane   [map[effect:NoSchedule key:node-role.kubernetes.io/control-plane]]
alice-worker          [map[effect:NoSchedule key:key1 value:xxx] [effect:NoExecute key:key2 value:yyy]]
alice-worker2         [map[effect:NoSchedule key:key1 value:zzz]]
```

key が `key1` で value が `xxx` の Taint が削除されたことが確認できる。

### Taint を解除する

Taint を解除するには `kubectl taint` コマンドに `-` を付けるだけで可能。

```sh
$ kubectl taint node alice-worker key1=xxx:NoSchedule-

# alice-worker ノードの key1=xxx:NoSchedule が消えている
$ kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
NAME                  TAINTS
alice-control-plane   [map[effect:NoSchedule key:node-role.kubernetes.io/control-plane]]
alice-worker          [map[effect:NoExecute key:key2 value:yyy]] # [!code ++]
alice-worker2         [map[effect:NoSchedule key:key1 value:zzz]]
```

### Pod を作成する

上記で Taint を使ってノードに汚れを付けることができたので、一度 Pod を作成して挙動を確認する。

```sh
$ kubectl run nginx --image nginx:1.23.2

$ kubectl get po -w
NAME    READY   STATUS    RESTARTS   AGE
nginx   0/1     Pending   0          1m16s
^C
```

`-w` オプションを使って作成した Pod の状況を確認するもいくら時間が経過してもステータスは Pending のまま止まってしまう。

```sh
$ kubectl describe po nginx | grep -i events: -A5
Events:
  Type     Reason            Age    From               Message
  ----     ------            ----   ----               -------
  Warning  FailedScheduling  6m56s  default-scheduler  0/3 nodes are available: 1 node(s) had untolerated taint {key1: zzz}, 1 node(s) had untolerated taint {key2: yyy}, 1 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }. preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling..
```

Pod が立ち上がらない原因としては、存在するノード全てに Taint が設定されているが、それを許容する Toleration が設定されていないためスケジューリングができない状態になっているため。

## Toleration

### Toleration を付与して Taint を許容する

Pod が Taint を許容するために Toleration を付与する。設定項目の詳細については後述する。

```sh
$ cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: busybox
  name: busybox
spec:
  containers:
  - image: busybox:1.36.0
    name: busybox
    command:
    - sleep
    - "1d"
  restartPolicy: Always
  tolerations:
  - key: "key1"
    value: "zzz"
    effect: "NoSchedule"
    operator: "Equal"
EOF
```

Pod の状況を確認する。

```sh
$ kubectl get po -o wide
NAME      READY   STATUS    RESTARTS   AGE     IP           NODE            NOMINATED NODE   READINESS GATES
busybox   1/1     Running   0          63s     10.244.2.3   alice-worker2   <none>           <none> # [!code ++]
nginx     0/1     Pending   0          4m15s   <none>       <none>          <none>           <none>
```

Running になり、`alice-worker2` ノードで Pod が立ち上がっているのが分かる。これは `alice-worker2` ノードの Taint と一致するものを busybox Pod の `.spec.tolerations[0]` に設定することによって Taint を許容し、立ち上げることができている。

ここで気になるのが、`.spec.tolerations` に設定する key, value 以外の項目ではないだろうか。順を追って解説する。

### effect の種類

| 種類               | 説明                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `NoSchedule`       | Taint と Toleration が一致したあるいは存在した場合にのみスケジューリングする。                                                   |
| `PreferNoSchedule` | Taint と一致するあるいは存在するノードを探し、スケジューリングを試みる。ただし、見つからない場合は許容できないノードで実行する。 |
| `NoExecute`        | Taint が付与された時にマッチする Toleration がない Pod はノードから排除される。つまり既存の Pod にも影響が出る。                 |

`NoSchedule` については上記で確認できたので、 `PreferNoSchedule`, `NoExecute` について簡単に確認する。

#### `PreferNoSchedule`

試すにあたり既存の Taint を `NoExecute` から `PreferNoSchedule` 付け替える。

```sh
$ kubectl taint node alice-worker key2=yyy:NoExecute-
$ kubectl taint node alice-worker key2=yyy:PreferNoSchedule

$ kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
NAME                  TAINTS
alice-control-plane   [map[effect:NoSchedule key:node-role.kubernetes.io/control-plane]]
alice-worker          [map[effect:PreferNoSchedule key:key2 value:yyy]] # [!code ++]
alice-worker2         [map[effect:NoSchedule key:key1 value:zzz]]
```

しばらくして Pod 状況を確認すると、以前は Pending で立ち上がらなかった nginx Pod が alice-worker ノードで起動している。

```sh
$ kubectl get po -o wide
NAME      READY   STATUS    RESTARTS   AGE     IP           NODE            NOMINATED NODE   READINESS GATES
busybox   1/1     Running   0          6h13m   10.244.1.2   alice-worker2   <none>           <none>
nginx     1/1     Running   0          6h14m   10.244.2.3   alice-worker    <none>           <none> # [!code ++]
```

#### `NoExecute`

繰り返しになるが、先程付け替えた Taint を元に戻す。

```sh
$ kubectl taint node alice-worker key2=yyy:PreferNoSchedule-
$ kubectl taint node alice-worker key2=yyy:NoExecute

$ kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
NAME                  TAINTS
alice-control-plane   [map[effect:NoSchedule key:node-role.kubernetes.io/control-plane]]
alice-worker          [map[effect:NoExecute key:key2 value:yyy]] # [!code ++]
alice-worker2         [map[effect:NoSchedule key:key1 value:zzz]]
```

すると nginx Pod が消えている。Taint を満たすノードが見つからず、起動中であったにもかかわらず排除されたのが分かる。

```sh
$ kubectl get po -o wide
NAME      READY   STATUS    RESTARTS   AGE     IP           NODE            NOMINATED NODE   READINESS GATES
busybox   1/1     Running   0          6h19m   10.244.1.2   alice-worker2   <none>           <none>
```

### operator の種類

| operator の種類   | 説明                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `Equal` (default) | key, value, effect が同じ Taint を持つノードにスケジューリング<br />operator を指定しない場合 Equal になる。 |
| `Exists`          | key, effect が同じ Taint を持つノードにスケジューリング（value は省略可能）                                  |

#### `Exists`

Equal については上記で動作を確認できたので `Exists` についてのみ試してみる。

```sh
$ kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
NAME                  TAINTS
alice-control-plane   [map[effect:NoSchedule key:node-role.kubernetes.io/control-plane]]
alice-worker          [map[effect:NoExecute key:key2 value:yyy]]
alice-worker2         [map[effect:NoSchedule key:key1 value:zzz]]
```

```sh
$ cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: operator-exists
  name: operator-exists
spec:
  containers:
  - command:
    - sleep
    - "999"
    image: busybox:1.26.0
    name: operator-exists
  restartPolicy: Always
  tolerations:
  - key: "key1"
    effect: "NoSchedule"
    operator: "Exists"
EOF
```

Pod の一覧を確認する。

```sh
$ kubectl get po -o wide
NAME              READY   STATUS    RESTARTS   AGE     IP           NODE            NOMINATED NODE   READINESS GATES
busybox           1/1     Running   0          7h12m   10.244.1.2   alice-worker2   <none>           <none>
operator-exists   1/1     Running   0          13s     10.244.1.3   alice-worker2   <none>           <none> # [!code ++]
```

ちゃんと指定した通り、key: `key1`, effect: `NoSchedule` の Taint がある `alice-worker2` ノードで Pod が実行されているのが分かる。

## まとめ

Tain/Toleration について触ってみた。実際に動かしてみることで設定を変えるとこう動作するのか！と挙動を確認できたと思う。

## 参考

https://kubernetes.io/ja/docs/concepts/scheduling-eviction/taint-and-toleration/
