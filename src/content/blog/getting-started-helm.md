---
title: Kubernetes のパッケージマネージャ Helm を触ってみた
date: "2022-06-26"
tags: ["k8s", "Helm", "DevOps"]
draft: false
summary: 今更ながら Helm を触ってみたので概要をまとめてみた
---

## はじめに

Kubernetes のパッケージマネージャ Helm を概要を学んだのでまとめてみた。

## Helm とは

一言で言うと、Kubernetes(以下 k8s) のパッケージマネージャである。

k8s のリソースを作る際、YAML で書かれたマニフェストファイルを kubectl コマンドで適用することになる。しかし、サービスの規模が大きくなるにつれ、似たようなマニフェストファイルが大量に必要になってしまう。その場合、**マニフェストファイルを再利用**できたり、**一括変更**などができると非常に効率的だ。まさにこの問題を解決してくれるのが Helm となっている。

## Helm の構成要素

Helm には大きく 3 つの概念が登場する。

| name                       | description                                              | more info                                                                                 |
| -------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **チャート(Chart)**        | k8s のリソース一式をパッケージ化して再利用可能にしたもの | Homebrew における formulae、APT における dep などのイメージ                               |
| **リポジトリ(Repository)** | Helm Chart を保存する場所                                | チャートを提供する Web サーバで、チャートの実体は index.yaml と tar.gz 形式で圧縮したもの |
| **リリース(Release)**      | Helm Chart からデプロイされた 1 つのかたまり             | リリース名で識別できるため、1 つのチャートから複数のリソースを作成することなどが可能      |

## 事前準備

### Helm CLI のインストール

利用する macOS 上に Homebrew 経由でインストールする。

```shell
$ brew install helm

$ helm version --short
v3.9.0+g7ceeda6
```

[GitHub にバイナリが公開](https://github.com/helm/helm/releases)されているため、それをダウンロードしてパスを通すだけなので Homebrew を使わずにインストールすることももちろんできる。

次に helm コマンドの補完設定を行う。

helm コマンドには bash, fish, powershell, zsh の補完機能を備えているのでお使いのシェルが対応していれば設定しておくのをおすすめする。
以下は zsh についての設定方法を書いておく。

```shell
$ echo "source <(helm completion zsh)" >> ~/.zshrc

$ source ~/.zshrc
```

### kubectl と k8s クラスタ

helm コマンドは k8s クラスタ対して kubectl コマンドを実行してリソースをデプロイする。そのため使用するマシン上に kubectl コマンドがインストールされている、かつ kubectl コマンドで操作できる k8s クラスタが必要となる。

今回は Docker Desktop for Mac を使用する。

- Docker
  - v20.10.16
- kubectl
  - 1.24.0

## チュートリアル

ここでは ローカルの Kubernetes クラスタに WordPress をデプロイする過程で Helm の理解を深めていく。

### リポジトリの登録

リポジトリからチャートをインストールする場合、ローカルにリポジトリを登録する必要がある。

Helm の公式が提供しているのが stable, incubator というリポジトリがあるが、Deprecated になっている。[^1]
現在は、いろんな組織がホストするリポジトリにチャートが散らばっている。しかし、それカバーしてくれるかのように Artifact Hub というサイトが存在する。

[Artifact Hub](https://artifacthub.io/)

このサイトにいろんな Helm チャートがまとめて掲載してあり、使いたいものがあるか検索できるようになっている。

登録は `helm repo add` コマンドで行う。bitnami 社が提供する Repository を追加する。

```shell
$ helm repo add bitnami https://charts.bitnami.com/bitnami
"bitnami" has been added to your repositories
```

追加したリポジトリの一覧を確認するには `helm repo list` コマンドを実行する。

```shell
$ helm repo list
NAME                URL
bitnami             https://charts.bitnami.com/bitnami
```

リポジトリはローカルにキャッシュするため、もし追加してから時間が空いてしまった場合は更新した方が良い。以下のコマンドで最新の状態に更新する。

```shell
$ helm repo update bitnami
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "bitnami" chart repository
Update Complete. ⎈Happy Helming!⎈
```

### チャートの検索

リポジトリを追加したら、その中に含まれているチャートを検索できる。検索は `helm search repo` コマンドを使用し、WordPress のチャートを検索してみる。

```shell
$ helm search repo wordpress
NAME                   	CHART VERSION	APP VERSION	DESCRIPTION
bitnami/wordpress      	15.0.2       	6.0.0      	WordPress is the world's most popular blogging ...
bitnami/wordpress-intel	2.0.2        	6.0.0      	WordPress for Intel is the most popular bloggin...
```

これを見ると、`bitnami/wordpress` と `bitnami/wordpress-intel` の chart があることを確認できる。

### チャートのインストール

上記で確認した `bitnami/wordpress` というチャートを実際にインストールしてみる。インストールと同時に k8s リソースがデプロイされる。

コマンドは `helm install` を使用し、リリース名として任意の名前を付与する。今回は簡易的に `my-release` という名前でデプロイする。

```shell
$ helm install my-release bitnami/wordpress
NAME: my-release
LAST DEPLOYED: Sat Jun 25 23:29:01 2022
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: wordpress
CHART VERSION: 15.0.4
APP VERSION: 6.0.0

** Please be patient while the chart is being deployed **

Your WordPress site can be accessed through the following DNS name from within your cluster:

    my-release-wordpress.default.svc.cluster.local (port 80)

To access your WordPress site from outside the cluster follow the steps below:

1. Get the WordPress URL by running these commands:

  NOTE: It may take a few minutes for the LoadBalancer IP to be available.
        Watch the status with: 'kubectl get svc --namespace default -w my-release-wordpress'

   export SERVICE_IP=$(kubectl get svc --namespace default my-release-wordpress --include "{{ range (index .status.loadBalancer.ingress 0) }}{{ . }}{{ end }}")
   echo "WordPress URL: http://$SERVICE_IP/"
   echo "WordPress Admin URL: http://$SERVICE_IP/admin"

2. Open a browser and access WordPress using the obtained URL.

3. Login with the following credentials below to see your blog:

  echo Username: user
  echo Password: $(kubectl get secret --namespace default my-release-wordpress -o jsonpath="{.data.wordpress-password}" | base64 -d)
```

インストール結果が出力され、リリースが作成されたことを確認できる。リリースの一覧を確認する場合は `helm list` コマンドを使って確認できる。

```shell
$ helm list
NAME      	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART           	APP VERSION
my-release	default  	1       	2022-06-25 23:29:01.402517 +0900 JST	deployed	wordpress-15.0.4	6.0.0

$ helm history my-release
REVISION	UPDATED                 	STATUS  	CHART           	APP VERSION	DESCRIPTION
1       	Sat Jun 25 23:29:01 2022	deployed	wordpress-15.0.4	6.0.0      	Install complete
```

`helm history` コマンドでリビジョンの一覧を確認してももちろん 1 となっている。

リリースの実体を確認するには kubectl コマンドを使って確認してみる。

```shell
$ alias k=kubectl

$ k get all | grep -v services/kubernetes
NAME                            READY   STATUS    RESTARTS        AGE
pod/wordpress-f864f6846-zbvnr   1/1     Running   1 (4m28s ago)   6m34s
pod/wordpress-mariadb-0         1/1     Running   0               6m33s

NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
service/wordpress           LoadBalancer   10.107.234.199   localhost     80:30057/TCP,443:30521/TCP   6m34s
service/wordpress-mariadb   ClusterIP      10.103.7.239     <none>        3306/TCP                     6m34s

NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/wordpress   1/1     1            1           6m34s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/wordpress-f864f6846   1         1         1       6m34s

NAME                                 READY   AGE
statefulset.apps/wordpress-mariadb   1/1     6m34s
```

k8s リソースで Deployment, Service がデプロイされているのが分かる。

## リリースのアップグレード

デフォルトのまま `helm install` すると Service が LoadBalancer で作成され、ローカルだとアクセスして確認ができない。
このように、k8s の設定をカスタマイズしたいということがよくあるだろう。そういう場合は、Helm はパラメータを渡すだけで設定ができるようになっており割と自由度が高い。

どんなパラメータを設定できるのかを確認するには `helm show values` コマンドを使用する。

```shell
$ helm show values bitnami/wordpress | wc -l
  1168
```

`bitnami/wordpress` チャートについては 1168 個の項目が設定できるようだ。

`helm show values` コマンドでは YAML ファイル形式で出力するが、特定の値を確認したい場合 `--jsonpath` オプションを使うことで絞り込んで表示できる。

```shell
$ helm show values bitnami/wordpress --jsonpath='{ .service.type }{ "\n" }'
LoadBalancer
```

この辺は kubectl コマンドのオプションをそのまま使えるので便利だ。

デフォルトだと LoadBalancer なので Service の type を NodePort に変更して、ローカルのブラウザから WordPress の画面へアクセスできようにする。

`helm upgrade` コマンドを使ってリリースをアップグレードできる。その際、`--set key=value` 形式かあるいは `-f override.yaml` でパラメータを上書きする YAML ファイルを指定できる。

```shell
$ helm upgrade my-release --set service.type=NodePort bitnami/wordpress
Release "my-release" has been upgraded. Happy Helming!
NAME: my-release
LAST DEPLOYED: Sat Jun 25 23:52:02 2022
NAMESPACE: default
STATUS: deployed
REVISION: 2
TEST SUITE: None
NOTES:
CHART NAME: wordpress
CHART VERSION: 15.0.4
APP VERSION: 6.0.0

** Please be patient while the chart is being deployed **

Your WordPress site can be accessed through the following DNS name from within your cluster:

    my-release-wordpress.default.svc.cluster.local (port 80)

To access your WordPress site from outside the cluster follow the steps below:

1. Get the WordPress URL by running these commands:

   export NODE_PORT=$(kubectl get --namespace default -o jsonpath="{.spec.ports[0].nodePort}" services my-release-wordpress)
   export NODE_IP=$(kubectl get nodes --namespace default -o jsonpath="{.items[0].status.addresses[0].address}")
   echo "WordPress URL: http://$NODE_IP:$NODE_PORT/"
   echo "WordPress Admin URL: http://$NODE_IP:$NODE_PORT/admin"

2. Open a browser and access WordPress using the obtained URL.

3. Login with the following credentials below to see your blog:

  echo Username: user
  echo Password: $(kubectl get secret --namespace default my-release-wordpress -o jsonpath="{.data.wordpress-password}" | base64 -d)
```

出力結果からも分かるがリビジョンが 2 となった。

```shell
$ helm history my-release
REVISION	UPDATED                 	STATUS    	CHART           	APP VERSION	DESCRIPTION
1       	Sat Jun 25 23:29:01 2022	superseded	wordpress-15.0.4	6.0.0      	Install complete
2       	Sat Jun 25 23:52:02 2022	deployed  	wordpress-15.0.4	6.0.0      	Upgrade complete
```

WordPress 用の Service の type が NodePort に変更された！

```shell
$ k get svc | grep -v kubernetes
NAME                   TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
my-release-mariadb     ClusterIP   10.108.157.3     <none>        3306/TCP                     28m
my-release-wordpress   NodePort    10.103.195.125   <none>        80:30119/TCP,443:31712/TCP   28m
```

[localhost:30119](http://localhost:30119) にアクセスすると WordPress のホーム画面が表示された！

![WordPress Home](https://i.imgur.com/SF9UAqh.webp)

同様に [localhost:30119/admin](http://localhost:30119/admin) にアクセスすると管理者用のログイン画面が表示される。

![WordPress login page](https://i.imgur.com/IRmDiyl.webp)

デフォルトだとユーザ名は `user` で、下記のコマンドを使って secret よりパスワードを取得できる。

```shell
$ echo Password: $(kubectl get secret --namespace default my-release-wordpress -o jsonpath="{.data.wordpress-password}" | base64 -d)
```

取得したパスワードを使って無事にログインできた。

![WordPress logged in](https://i.imgur.com/mEPIEhI.webp)

## リリースのアンインストール

一通り作業が終わったら `helm uninstall` コマンドを使ってリリースをアンインストールする。アンインストールすると、同時に k8s リソースも削除される。

```shell
$ helm uninstall my-release
release "my-release" uninstalled
```

## まとめ

k8s のパッケージマネージャ Helm を触ってみた！

チャートを使うと簡単に k8s リソース をデプロイできた。今回は Helm の概念、チャートの使い方の紹介に留めたがチャートを自分で作ってみてもっと深めてみたい。

## 参考

https://helm.sh/ja/

https://github.com/helm/helm

https://artifacthub.io/

https://qiita.com/thinksphere/items/5f3e918015cf4e63a0bc

https://knowledge.sakura.ad.jp/23603/

[^1]: [Important Helm Repo Changes & v2 End of Support in November \| Cloud Native Computing Foundation](https://www.cncf.io/blog/2020/10/07/important-reminder-for-all-helm-users-stable-incubator-repos-are-deprecated-and-all-images-are-changing-location/)
