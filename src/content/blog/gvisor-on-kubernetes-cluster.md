---
title: "RuntimeClass を使って Kubernetes クラスタで gVisor ランタイムを使う"
date: "2024-12-02"
tags: ["gVisor", "k8s", "Container", "Security"]
draft: false
summary: "低レベルコンテナランタイムである gVisor を導入することで Kubernetes クラスタのセキュリティを向上させる方法を紹介"
---

## はじめに

本記事では、Google が開発した低レベルコンテナランタイムである gVisor を利用して、特定の Kubernetes ノードでセキュリティを強化する方法を解説する。

今回使用した環境は以下の通りである。

- OS: Linux (Ubuntu 22.04 LTS) x 3
  - 2 vCPU
  - 4GB Memory
  - 60GB Disk
- Kubernetes: v1.31.3
- Containerd v1.7.24

## gVisor とは

gVisor は、Google によって開発された低レベルのコンテナランタイムで、セキュリティを重視した設計が特徴となっている。**runsc** とも言われる。

従来のコンテナランタイムと異なり、gVisor はシステムコールを直接ホストカーネルに渡すのではなく、独自にエミュレートすることにより、セキュリティが強化され、ホストカーネルへの攻撃や意図しない操作から保護する効果がある。

https://gvisor.dev/

Kubernetes クラスタでは、通常 Containerd や CRI-O などの CRI ランタイムが利用されており、それらがさらに低レベルの OCI ランタイムを呼び出してコンテナを実行している。

## 今回試すこと

デフォルトだと、Containerd では runc が使われているが、gVisor と併用することもできる。Kubernetes クラスタでは RuntimeClass というリソースを使用することで、特定の Pod に対して異なる OCI ランタイムを柔軟に指定することができる。

## 事前準備

### 現在の Containerd の設定を確認

```sh
# Containerd の設定ファイルを確認
$ grep -A 3 runtimes /etc/containerd/config.toml
      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]

        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
          base_runtime_spec = ""
          cni_conf_dir = ""
          cni_max_conf_num = 0
--
          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
            BinaryName = ""
            CriuImagePath = ""
            CriuPath = ""
```

上記のコマンドで、Containerd にランタイムがどのように定義されているかを確認した。runc がデフォルトとして登録されており、それ以外は設定されていないのが分かる。

### ノードに gVisor を導入

次に、任意のワーカーノードに gVisor を導入する。

```sh
$ ssh k8s-study2
```

下記の公式ドキュメントを参考にした。

https://gvisor.dev/docs/user_guide/install/

```sh
# インストール
$ (
  set -e
  ARCH=$(uname -m)
  URL=https://storage.googleapis.com/gvisor/releases/release/latest/${ARCH}
  wget ${URL}/runsc ${URL}/runsc.sha512 \
    ${URL}/containerd-shim-runsc-v1 ${URL}/containerd-shim-runsc-v1.sha512
  sha512sum -c runsc.sha512 \
    -c containerd-shim-runsc-v1.sha512
  rm -f *.sha512
  chmod a+rx runsc containerd-shim-runsc-v1
  sudo mv runsc containerd-shim-runsc-v1 /usr/local/bin
)

$ runsc --version
runsc version release-20241118.0
spec: 1.1.0-rc.1

$ runsc install

# containerd の設定ファイルを書き換える
$ vim /etc/containerd/config.toml
```

下記を `[plugins."io.containerd.grpc.v1.cri".containerd.runtimes]` の箇所にネストして記載する。

```txt:/etc/contained/config.toml
...
        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runsc]
          runtime_type = "io.containerd.runsc.v1"
...
```

```sh
# Containerd を再起動
$ sudo systemctl restart containerd

# ワーカーノードでの作業終わり
$ exit
```

## 検証

### RuntimeClass の作成

Kubernetes クラスタへ RuntimeClass リソースを作成する。

```yaml:rtc.yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: gvisor
handler: runsc
```

YAML はこちらを参考にした。

https://kubernetes.io/ja/docs/concepts/containers/runtime-class/

```sh
$ kubectl apply -f rtc.yaml

$ kubectl get runtimeclass
NAME     HANDLER   AGE
gvisor   runsc     5s

$ kubectl describe runtimeclass gvisor
Name:         gvisor
Namespace:
Labels:       <none>
Annotations:  <none>
API Version:  node.k8s.io/v1
Handler:      runsc
Kind:         RuntimeClass
Metadata:
  Creation Timestamp:  2024-12-02T02:37:41Z
  Resource Version:    1121670
  UID:                 b54b5073-d9f8-4c63-9b60-7761b4c4549f
Events:                <none>
```

### Pod の作成

これで準備が整ったので、実際に Pod を作成して試してみる。

Pod は以下のように 2 つ作成する。

1. RuntimeClass の設定なし
2. RuntimeClass の設定あり（`gVisor` を指定）

```yaml:nginx-gvisor.yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: nginx-gvisor
  name: nginx-gvisor
spec:
  nodeName: k8s-study2      # gVisor を導入したノードを指定
  runtimeClassName: gvisor  # RuntimeClass 名を指定
  containers:
  - image: nginx
    name: nginx-gvisor
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

```sh
# 1 つ目の Pod を作成
$ kubectl run nginx --image nginx

# 2 つ目の Pod を作成
$ kubectl apply -f nginx-gvisor.yaml

# Pod の状態を確認
$ kubectl get po -o wide
NAME           READY   STATUS    RESTARTS   AGE     IP               NODE            NOMINATED NODE   READINESS GATES
nginx          1/1     Running   0          2m25s   192.168.44.144   k8s-study2      <none>           <none>
nginx-gvisor   1/1     Running   0          8s      192.168.44.147   k8s-study2      <none>           <none>
```

### 動作確認

それぞれの Pod 内で `dmesg` コマンドを使って、カーネルのログを確認する。

```sh
$ kubectl exec nginx -- dmesg
dmesg: read kernel buffer failed: Operation not permitted
command terminated with exit code 1

$ kubectl exec nginx-gvisor -- dmesg
[    0.000000] Starting gVisor...
[    0.454514] Letting the watchdogs out...
[    0.707171] Conjuring /dev/null black hole...
[    1.192689] Checking naughty and nice process list...
[    1.464322] Waiting for children...
[    1.654970] Segmenting fault lines...
[    1.752302] Creating bureaucratic processes...
[    2.165221] Reading process obituaries...
[    2.399834] Granting licence to kill(2)...
[    2.444516] Checking naughty and nice process list...
[    2.611171] Forking spaghetti code...
[    2.711935] Setting up VFS...
[    3.137197] Setting up FUSE...
[    3.567744] Ready!
```

結果としては、1 つ目の nginx Pod の方では何も表示されないが、2 つ目の nginx-gvisor Pod では gVisor に関するログを確認できた。

ワーカーノードに入って `crictl` コマンドを使う方法でもランタイムの情報を確認することができる。

```sh
$ ssh k8s-study2
```

```sh
$ crictl ps | grep nginx
CONTAINER           IMAGE               CREATED              STATE               NAME                        ATTEMPT             POD ID              POD
d68725fd30aab       1ee494ebb83f2       2 minutes ago        Running             nginx-gvisor                0                   568b0c5f94069       nginx-gvisor
1f4c575e24a61       1ee494ebb83f2       4 minutes ago        Running             nginx                       0                   4627faa7cc3ed       nginx

# nginx コンテナの場合
$ crictl inspect --output go-template --template='{{ .info.runtimeType }}' 1f4c575e24a61
io.containerd.runc.v2

# nginx-gvisor コンテナの場合
$ crictl inspect --output go-template --template='{{ .info.runtimeType }}' d68725fd30aab
io.containerd.runsc.v1
```

## まとめ

本記事では、Kubernetes クラスタの任意のノードに gVisor を導入する手順を紹介した。gVisor は、特にセキュリティ要件の高い環境で有効な低レベルコンテナランタイムであり、Kubernetes ではそれを自由に選択できる RuntimeClass というリソースの使い方を確認した。

使い方についてはまだ深掘りが必要だが、従来のランタイムである runc と使い分けることで、セキュリティの高いユースケースにも対応できるのではないかと思う。

## 参考

https://gvisor.dev/

https://kubernetes.io/ja/docs/concepts/containers/runtime-class/

https://blog.inductor.me/entry/2021/04/30/022505

https://speakerdeck.com/makocchi/lets-learn-about-kubernetes-runtime-class

https://c.itdo.jp/technical-information/docker-kubernetes/kubernetes-gvisor/
