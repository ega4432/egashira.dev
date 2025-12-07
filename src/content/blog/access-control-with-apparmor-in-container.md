---
title: "AppArmor を使ったコンテナ内のアクセス制御"
date: "2024-11-30"
tags: ["AppArmor", "k8s", "Container", "Security", "Linux"]
draft: false
summary: "Linux のセキュリティモジュールである AppArmor を Kubernetes クラスタに導入する手順についての備忘録"
---

## はじめに

Kubernetes では、セキュリティ強化のために様々な仕組みが用意されている。その中で、Linux のセキュリティモジュールである AppArmor を活用することで、コンテナ単位での細かいアクセス制御を行うことができる。

本記事では、AppArmor を Kubernetes クラスタに導入し、プロファイルを適用する手順について解説する。

ちなみに AppArmor は Kubernetes v1.31 で stable としてリリースされたので、試したい場合はこれ以降のバージョンを使うと良い。

https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.31.md

今回使用した環境は以下の通りである。

- OS: Linux (Ubuntu 22.04 LTS) x 3
  - 2 vCPU
  - 4GB Memory
  - 60GB Disk
- Kubernetes: v1.31.3

```sh
$ kubectl get nodes -o wide
NAME            STATUS   ROLES           AGE     VERSION   INTERNAL-IP      EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION       CONTAINER-RUNTIME
k8s-study       Ready    control-plane   3d17h   v1.31.3   159.89.193.134   <none>        Ubuntu 22.04.4 LTS   5.15.0-113-generic   containerd://1.7.24
k8s-study2      Ready    worker          2d20h   v1.31.3   152.42.177.36    <none>        Ubuntu 22.04.4 LTS   5.15.0-113-generic   containerd://1.7.24
k8s-study3      Ready    worker          2d19h   v1.31.3   152.42.233.44    <none>        Ubuntu 22.04.4 LTS   5.15.0-113-generic   containerd://1.7.24
```

## AppArmor の概要

AppArmor は、Linux のカーネルレベルで動作するセキュリティモジュールであり、特定のアプリケーションに対して許可された操作を定義することで、不正な操作を制限する仕組みである。
Kubernetes では、Pod やコンテナに AppArmor プロファイルを適用することで、セキュリティポリシーを厳密に管理することが可能。

公式ドキュメントはこちら。

https://kubernetes.io/docs/tutorials/clusters/apparmor/

## AppArmor のサポート状況を確認

### ノード

今回利用している Ubuntu や SUSE などではデフォルトで有効になっていることが多い。下記のファイルで状況を確認できる。

また、`apparmor_status` コマンド（または `aa-status`）を使うことで Linux カーネルでの現在の AppArmor の設定状況を確認できる。

```sh
$ cat /sys/module/apparmor/parameters/enabled
Y

$ aa-status --profiled  # `--profiled` オプションで現在適用されているポリシーの数を表示
42
```

### コンテナランタイム

次に、Kubernetes で利用されているコンテナランタイム (Containerd, CRI-O など) が AppArmor をサポートしている必要がある。そのため、そちらについて確認していく。今回利用しているのは Containerd なので以下のようなコマンドで確認した。

```sh
$ containerd config dump | grep apparmor
    disable_apparmor = false
```

## ノードに AppArmor プロファイルを適用

AppArmor プロファイルは、コンテナが実行できる操作を制限するルールセットである。

本記事では、確認のためワーカーノードの 1 つに簡易的なプロファイルを設定して検証してみる。

```text:~/aa-profile
#include <tunables/global>

profile deny-write flags=(attach_disconnected) {
  #include <abstractions/base>

  file,

  # Deny all file writes.
  deny /** w,
}
```

このプロファイルでは、ファイルへの書き込みの制限をしている。

プロファイルを適用するために以下を実行する。

```sh
# ノードにコピー
$ scp aa-profile k8s-study2:~/

# 適用したいノードに入る
$ ssh k8s-study2

# `apparmor_parser` コマンドで適用
root@k8s-study2:~# apparmor_parser -q ./aa-profile

# `aa-status` コマンドで確認
root@k8s-study2:~# aa-status | grep deny-write
   deny-write
```

### Pod を作成

```yaml:apparmor-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: apparmor
spec:
  nodeName: k8s-study2       # ノードを指定
  securityContext:           # AppArmor の設定
    appArmorProfile:
      type: Localhost
      localhostProfile: deny-write
  containers:
  - name: busybox
    image: busybox:1.28
    command: [ "sh", "-c", "echo 'Hello AppArmor!' && sleep 1h" ]
```

上記の YAML を適用して、Pod を作成する。

```sh
$ kubectl apply -f apparmor-pod.yaml

# ちゃんと指定したノードで起動しているか確認
$ kubectl get po -o wide
NAME       READY   STATUS    RESTARTS   AGE   IP               NODE            NOMINATED NODE   READINESS GATES
apparmor   1/1     Running   0          96s   192.168.44.185   k8s-study2      <none>           <none>
```

## テスト

Pod をデプロイ後、AppArmor プロファイルが正常に適用されているかを確認する。
Pod 内で制限された操作を試みることで、期待通りにアクセスが制限されているか確認可能である。

```sh
$ kubectl exec apparmor -- touch sample.txt
touch: sample.txt: Permission denied
command terminated with exit code 1
```

ファイルへの作成を試たが、AppArmor によって制限されているため失敗した。

```sh
# 別の Pod を起動（ここでは SecurityContext など設定しない）
$ kubectl run nginx --image nginx

$ kubectl get po -o wide
NAME       READY   STATUS                 RESTARTS        AGE   IP               NODE            NOMINATED NODE   READINESS GATES
apparmor   0/1     CreateContainerError   7 (2m54s ago)   33m   192.168.44.133   k8s-study2      <none>           <none>
nginx      1/1     Running                2 (3m21s ago)   17m   192.168.44.130   k8s-study2      <none>           <none>

# ファイルの作成を実行
$ kubectl exec nginx -- touch /tmp/sample.txt

# 確認
$ kubectl exec nginx -- ls /tmp
sample.txt
```

このように、Pod に SecurityContext を設定していなければ AppArmor プロファイルは適用されないのも確認できた。

## まとめ

この記事では、Kubernetes クラスタで AppArmor を使い、Pod にプロファイルを適用して動きを確かめてみた。AppArmor を活用することで、Pod の安全性を向上させることができることが分かった。

## 参考

https://kubernetes.io/docs/tutorials/clusters/apparmor/

https://kubernetes.io/docs/concepts/security/linux-kernel-security-constraints/#apparmor

https://wiki.ubuntu.com/AppArmor

https://kakakakakku.hatenablog.com/entry/2022/04/12/094701

https://tetsuya-isogai.medium.com/apparmor%E3%82%92kubernetes%E4%B8%8A%E3%81%A7%E4%BD%BF%E3%81%86-23de2ba6cc0e
