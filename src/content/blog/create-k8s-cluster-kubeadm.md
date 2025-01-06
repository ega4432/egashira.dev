---
title: "kubeadm での Kubernetes クラスタ構築"
date: "2024-11-28"
tags: ["k8s", "Container"]
draft: false
summary: "kubeadm を使った Kubernetes クラスタ構築の手順についての備忘録"
---

## はじめに

今回使用した環境は以下の通り。

- OS: Linux(Ubuntu22.04 LTS)
  - 2 vCPU
  - 2GB Memory
  - 60GB Disk
- Kubernetes: v1.31.3
- Containerd: v1.7.24
- CNI: Calico v3.25.0

## 事前準備

kubeadm コマンドをインストールする前の事前準備を行う。実施する内容については、下記に記載されている。

https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#%E5%A7%8B%E3%82%81%E3%82%8B%E5%89%8D%E3%81%AB

マシンに SSH して移行の手順を行った。

### swap の無効化

```sh
$ swapoff -a
```

マシンを再起動した際も永続化されるように `/etc/fstab` を編集する。

```:/etc/fstab
# コメントアウトしておく
# /swap.img   none   swap   sw   0    0
```

## コンテナランタイムのインストール

Kubernetes の稼働にはコンテナランタイムが必要となる。

https://kubernetes.io/ja/docs/setup/production-environment/container-runtimes/

Docker, Containerd, CRI-O などがあるが、今回は Kubernetes でデファクトスタンダードとなっている Containerd を採用した。

### IPv4フォワーディングを有効化し、iptablesからブリッジされたトラフィックを見えるようにする

まずは、こちらを参考に作業を行う。

https://kubernetes.io/ja/docs/setup/production-environment/container-runtimes/#ipv4%E3%83%95%E3%82%A9%E3%83%AF%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E5%8C%96%E3%81%97-iptables%E3%81%8B%E3%82%89%E3%83%96%E3%83%AA%E3%83%83%E3%82%B8%E3%81%95%E3%82%8C%E3%81%9F%E3%83%88%E3%83%A9%E3%83%95%E3%82%A3%E3%83%83%E3%82%AF%E3%82%92%E8%A6%8B%E3%81%88%E3%82%8B%E3%82%88%E3%81%86%E3%81%AB%E3%81%99%E3%82%8B

```sh
# Linux カーネルの IPv4 フォワーディング機能を有効にする
$ cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

$ sudo modprobe overlay
$ sudo modprobe br_netfilter

# Kubernetes クラスタ内で iptables を使用してトラフィックを制御するように設定
$ cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# カーネルパラメーターを適用
$ sudo sysctl --system
```

これらの作業は Kubernetes クラスタでコンテナや Pod 間のネットワーク通信を正しく処理し、トラフィックが意図した通りにルーティングされるようにするために必要となる。

### Containerd のインストール

下記の公式ドキュメントに従って進めた。インストールしたバージョンは記事執筆時の最新バージョンを使っているので、適宜利用したいバージョンに置き換えてもらえればと思う。

https://github.com/containerd/containerd/blob/main/docs/getting-started.md

```sh
# ダウンロードしたいバージョンを指定する: containerd-<VERSION>-<OS>-<ARCH>.tar.gz
$ wget https://github.com/containerd/containerd/releases/download/v1.7.24/containerd-1.7.24-linux-amd64.tar.gz
$ tar Cxzvf /usr/local/ containerd-1.7.24-linux-amd64.tar.gz

# systemd 経由で containerd を起動する場合は、下記もダウンロード
$ wget https://raw.githubusercontent.com/containerd/containerd/main/containerd.service
$ mkdir -p /usr/local/lib/systemd/system
$ mv containerd.service /usr/local/lib/systemd/system/

# systemd へ変更を反映させる
$ systemctl daemon-reload
$ systemctl enable --now containerd
Created symlink /etc/systemd/system/multi-user.target.wants/containerd.service → /usr/local/lib/systemd/system/containerd.service.
```

### runc のインストール

引き続き containerd のドキュメントを参照して、低レベルのコンテナランタイムとして runc を導入した。

```sh
$ wget https://github.com/opencontainers/runc/releases/download/v1.2.2/runc.amd64

$ install -m 755 runc.amd64 /usr/local/sbin/runc
```

### CNI プラグインのインストール

```sh
$ wget https://github.com/containernetworking/plugins/releases/download/v1.6.0/cni-plugins-linux-amd64-v1.6.0.tgz
$ mkdir -p /opt/cni/bin
$ tar Cxzvf /opt/cni/bin cni-plugins-linux-amd64-v1.6.0.tgz
```

### systemd cgroup ドライバーを構成

下記を参照すると runc が systemd cgroup ドライバーを使うようにするには設定をする必要がある。

https://kubernetes.io/ja/docs/setup/production-environment/container-runtimes/#systemd-cgroup%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%83%BC%E3%82%92%E6%A7%8B%E6%88%90%E3%81%99%E3%82%8B

```sh
$ mkdir -p /etc/containerd
$ containerd config default > /etc/containerd/config.toml

# SystemdCgroup を false -> true　に置換
$ sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```

なぜこの作業が必要かというと Kubernetes(kubelet)側では、systemd をデフォルトで cgroup ドライバーとして期待している一方で、コンテナランタイム(Containerd)側では、cgroupfs が使用されるためドライバーを一致させるために念の為設定しておく。

> Kubernetesでcontainerdを使用するには、CRIサポートを有効にする必要があります。 /etc/containerd/config.toml内のdisabled_pluginsリストにcriが含まれていないことを確認してください。

また、上記の通り公式ドキュメントに記載があるので、config.toml を編集するついでに上記も確認しておくと良い。

## kubelet, kubeadm, kubectl のインストール

事前準備が長かったが、いよいよコアとなるパッケージをインストールしていく。
公式のドキュメントは下記を参照。

https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/install-kubeadm/

```sh
$ sudo apt-get update
$ sudo apt-get install -y apt-transport-https ca-certificates curl gpg

$ curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

$ echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

$ sudo apt-get update
$ sudo apt-get install -y kubelet kubeadm kubectl

# 勝手にアップグレードされないようにする
$ sudo apt-mark hold kubelet kubeadm kubectl
```

## コントロールプレーンノードの初期化

これ以降は Calico の公式ドキュメントに従って進めた。

https://docs.tigera.io/calico/latest/getting-started/kubernetes/quickstart

### クラスタの作成

ここでは、使用する Calico の推奨 CIDR を指定した上で `kubeadm init` を実行する。

```sh
$ sudo kubeadm init --pod-network-cidr=192.168.0.0/16
# ここで `kubeadm join` コマンドが表示されていると思うので控えておく

# 上記コマンドが成功すると、出力されるので以下を実行
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config

# ノードを確認
$ kubectl get nodes
NAME        STATUS     ROLES           AGE   VERSION
k8s-study   NotReady   control-plane   54s   v1.31.3
```

### Calico をインストール

```sh
$ kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.1/manifests/tigera-operator.yaml
$ kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.1/manifests/custom-resources.yaml

# 全ての Pod が正常に動作しているか確認する
$ kubectl get po -A
```

## ワーカーノードの追加

ノードとして追加したいマシンに別途 SSH して入り、下記のコマンドを実行する。

```sh
$ kubeadm join <CONTROL_PLANE_IP>:6443 --token <TOKEN> \
        --discovery-token-ca-cert-hash sha256:<DISCOVERY_TOKEN_CA_CERT_HASH>
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-check] Waiting for a healthy kubelet at http://127.0.0.1:10248/healthz. This can take up to 4m0s
[kubelet-check] The kubelet is healthy after 1.002026242s
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```

上記のようなログが確認できると、コントロールプレーン側で kubectl を叩くとノードの状態を確認できる。

```sh
$ kubectl get nodes
NAME         STATUS   ROLES           AGE   VERSION
k8s-study    Ready    control-plane   21h   v1.31.3
k8s-study2   Ready    <none>          27m   v1.31.3
```

上記の kubectl join コマンドを忘れたり、トークンの有効期限が失効してしまった場合は、下記のコマンドで再度作成できる。

```sh
$ kubeadm token create --print-join-command
```

## まとめ

この記事では、kubeadm を用いた Kubernetes クラスタ構築の手順を紹介した。

最終的には、コントロールプレーンノード x 1、ワーカーノード x 2 の構成になった。

```sh
$ kubectl get nodes
NAME         STATUS   ROLES           AGE    VERSION
k8s-study    Ready    control-plane   21h    v1.31.3
k8s-study2   Ready    worker          36m    v1.31.3
k8s-study3   Ready    worker          6m1s   v1.31.3
```

今回実施した手順を通じて、Kubernetes クラスタの構築を体系的に理解し、Calico を活用したネットワーク設定を行うことができた。
公式ドキュメントに比較的手順がまとまっていたので、リンク先を参照しながら進めればあまり苦戦することなく完了できた。

## 参考

https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/

https://qiita.com/ktog/items/a63b6307c0ac32f0df4f

https://zaki-hmkc.hatenablog.com/entry/2020/04/05/103651
