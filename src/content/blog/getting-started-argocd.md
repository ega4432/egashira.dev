---
title: Argo CD のチュートリアルをやってみた
date: '2022-04-29'
tags: ['k8s', 'Argo CD', 'CI/CD', 'GitOps', 'DevOps']
draft: false
summary: Kubernetes のための宣言型 GitOps 継続的デリバリツールである Argo CD に入門した
---

## はじめに

Kubernetes（以下 k8s）のための宣言型 GitOps 継続的デリバリツールである Argo CD に入門するため下記の公式チュートリアルに取り組んでみた。

[Getting Started \- Argo CD \- Declarative GitOps CD for Kubernetes](https://argo-cd.readthedocs.io/en/stable/getting_started/)

前提として、今回使用した環境は以下になる。

- macOS Monterey 12.2.1
- Docker Desktop for Mac
- kubectl v1.22.1

## 1. Install Argo CD

Argo CD 用の Namespace を作成して進めていく。

```shell
$ k create ns argocd
namespace/argocd created

$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
customresourcedefinition.apiextensions.k8s.io/applications.argoproj.io created
customresourcedefinition.apiextensions.k8s.io/applicationsets.argoproj.io created
customresourcedefinition.apiextensions.k8s.io/appprojects.argoproj.io created
serviceaccount/argocd-application-controller created
serviceaccount/argocd-applicationset-controller created
serviceaccount/argocd-dex-server created
serviceaccount/argocd-notifications-controller created
serviceaccount/argocd-redis created
serviceaccount/argocd-server created
role.rbac.authorization.k8s.io/argocd-application-controller created
role.rbac.authorization.k8s.io/argocd-applicationset-controller created
role.rbac.authorization.k8s.io/argocd-dex-server created
role.rbac.authorization.k8s.io/argocd-notifications-controller created
role.rbac.authorization.k8s.io/argocd-server created
clusterrole.rbac.authorization.k8s.io/argocd-application-controller created
clusterrole.rbac.authorization.k8s.io/argocd-server created
rolebinding.rbac.authorization.k8s.io/argocd-application-controller created
rolebinding.rbac.authorization.k8s.io/argocd-applicationset-controller created
rolebinding.rbac.authorization.k8s.io/argocd-dex-server created
rolebinding.rbac.authorization.k8s.io/argocd-notifications-controller created
rolebinding.rbac.authorization.k8s.io/argocd-redis created
rolebinding.rbac.authorization.k8s.io/argocd-server created
clusterrolebinding.rbac.authorization.k8s.io/argocd-application-controller created
clusterrolebinding.rbac.authorization.k8s.io/argocd-server created
configmap/argocd-cm created
configmap/argocd-cmd-params-cm created
configmap/argocd-gpg-keys-cm created
configmap/argocd-notifications-cm created
configmap/argocd-rbac-cm created
configmap/argocd-ssh-known-hosts-cm created
configmap/argocd-tls-certs-cm created
secret/argocd-notifications-secret created
secret/argocd-secret created
service/argocd-applicationset-controller created
service/argocd-dex-server created
service/argocd-metrics created
service/argocd-notifications-controller-metrics created
service/argocd-redis created
service/argocd-repo-server created
service/argocd-server created
service/argocd-server-metrics created
deployment.apps/argocd-applicationset-controller created
deployment.apps/argocd-dex-server created
deployment.apps/argocd-notifications-controller created
deployment.apps/argocd-redis created
deployment.apps/argocd-repo-server created
deployment.apps/argocd-server created
statefulset.apps/argocd-application-controller created
networkpolicy.networking.k8s.io/argocd-application-controller-network-policy created
networkpolicy.networking.k8s.io/argocd-dex-server-network-policy created
networkpolicy.networking.k8s.io/argocd-redis-network-policy created
networkpolicy.networking.k8s.io/argocd-repo-server-network-policy created
networkpolicy.networking.k8s.io/argocd-server-network-policy created
```

いろいろインストールされたが、これらは一般的な Argo CD を実行できるためのリソースをクラスタに作っている。

## 2. Download Argo CD CLI

argocd コマンドを Homebrew でインストールする。

```shell
$ brew install argocd
```

## 3. Access The Argo CD API Server

`argocd-server` に外部からアクセスできるようにする。
その選択肢として…

- LoadBalancer
- Ingress
- Port Forwarding

の 3 パターンで実現できる。今回は一番手っ取り早く確認できる `Port Forwarding` で Service を公開せず API サーバに接続する。

```shell
$ k port-forward svc/argocd-server -n argocd 8080:443
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
Handling connection for 8080
```

http://localhost:8080 をブラウザで開くと、「この接続ではプライバシーが保護されません」と表示されるが、「詳細設定」> 「localhost にアクセスする（安全ではありません）」と進むと Argo CD のログイン画面が表示される。

![Argo CD Login page](https://i.imgur.com/crP65Jc.webp)

## 4. Login Using The CLI

Argo CD の管理者ユーザは `admin` 用の初期パスワードは、`argocd-initial-admin-secret` に設定されているので、下記のコマンドで確認し、CLI でログインする。

```shell
$ k -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
uQ2m3iqu9hNzyl5G

$ argocd login localhost:8080
WARNING: server certificate had error: x509: “Argo CD” certificate is not trusted. Proceed insecurely (y/n)? y
Username: admin
Password:
'admin:login' logged in successfully
Context 'localhost:8080' updated
```

`logged in successfully` となりログインできた。もちろんブラウザでも同じようにログインできる。

![Argo CD Dashboard](https://i.imgur.com/2HCtAcX.webp)

また、ログインができたらパスワードを変更し、初期パスワード用の Secret リソースを削除しておく。

```shell
$ argocd account update-password
*** Enter password of currently logged in user (admin):
*** Enter new password for user admin:
*** Confirm new password for user admin:
Password updated
Context 'localhost:8080' updated

$ k -n argocd delete secret argocd-initial-admin-secret
secret "argocd-initial-admin-secret" deleted
```

## 5. Register A Cluster To Deploy Apps To (Optional)

次は、デプロイするクラスタの登録だが、今回は同一クラスタ（Docker Desktop）上にアプリケーションをデプロイするのでスキップする。

別のクラスタにも対応しているのが地味に驚き。

## 6. Create An Application From A Git Repository

アプリケーションを Argo CD に登録する。Argo CD のデモのために公式がサンプルアプリをいくつか公開してくれているので、そちらを利用する。

[argoproj/argocd\-example\-apps: Example Apps to Demonstrate Argo CD](https://github.com/argoproj/argocd-example-apps)

なお、登録する方法として CLI, GUI の両方がサポートされており、チュートリアルでは両方が紹介されている。今回は CLI で登録するが、もし GUI での操作を見てみたい場合は[こちら](https://argo-cd.readthedocs.io/en/stable/getting_started/#creating-apps-via-ui)を確認して欲しい。

```shell
$ argocd app create guestbook --repo https://github.com/argoproj/argocd-example-apps.git \
    --path guestbook \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace default
application 'guestbook' created

$ argocd app list
NAME       CLUSTER                         NAMESPACE  PROJECT  STATUS     HEALTH   SYNCPOLICY  CONDITIONS  REPO                                                 PATH       TARGET
guestbook  https://kubernetes.default.svc  default    default  OutOfSync  Missing  <none>      <none>      https://github.com/argoproj/argocd-example-apps.git  guestbook
```

ブラウザの方にもアプリケーションを現れている。

![Argo CD create app](https://i.imgur.com/MTSLB2O.webp)

## 7. Sync (Deploy) The Application

ステータスを確認するとまだ同期していない状態なので、アプリケーションはまだデプロイされていない状態らしい。引き続き CLI でデプロイまでやっていく。

```shell
$ argocd app get guestbook
Name:               guestbook
Project:            default
Server:             https://kubernetes.default.svc
Namespace:          default
URL:                https://localhost:8080/applications/guestbook
Repo:               https://github.com/argoproj/argocd-example-apps.git
Target:             HEAD
Path:               guestbook
SyncWindow:         Sync Allowed
Sync Policy:        <none>
Sync Status:        OutOfSync from HEAD (53e28ff)
Health Status:      Missing

GROUP  KIND        NAMESPACE  NAME          STATUS     HEALTH   HOOK  MESSAGE
       Service     default    guestbook-ui  OutOfSync  Missing
apps   Deployment  default    guestbook-ui  OutOfSync  Missing

$ argocd app sync guestbook
TIMESTAMP                  GROUP        KIND   NAMESPACE                  NAME    STATUS    HEALTH        HOOK  MESSAGE
2022-04-26T20:36:33+09:00            Service     default          guestbook-ui  OutOfSync  Missing
2022-04-26T20:36:33+09:00   apps  Deployment     default          guestbook-ui  OutOfSync  Missing
2022-04-26T20:36:33+09:00            Service     default          guestbook-ui  OutOfSync  Missing              service/guestbook-ui created
2022-04-26T20:36:33+09:00   apps  Deployment     default          guestbook-ui  OutOfSync  Missing              deployment.apps/guestbook-ui created
2022-04-26T20:36:33+09:00            Service     default          guestbook-ui    Synced  Healthy                  service/guestbook-ui created
2022-04-26T20:36:33+09:00   apps  Deployment     default          guestbook-ui    Synced  Progressing              deployment.apps/guestbook-ui created

Name:               guestbook
Project:            default
Server:             https://kubernetes.default.svc
Namespace:          default
URL:                https://localhost:8080/applications/guestbook
Repo:               https://github.com/argoproj/argocd-example-apps.git
Target:             HEAD
Path:               guestbook
SyncWindow:         Sync Allowed
Sync Policy:        <none>
Sync Status:        Synced to HEAD (53e28ff)
Health Status:      Progressing

Operation:          Sync
Sync Revision:      53e28ff20cc530b9ada2173fbbd64d48338583ba
Phase:              Succeeded
Start:              2022-04-26 20:36:33 +0900 JST
Finished:           2022-04-26 20:36:33 +0900 JST
Duration:           0s
Message:            successfully synced (all tasks run)

GROUP  KIND        NAMESPACE  NAME          STATUS  HEALTH       HOOK  MESSAGE
       Service     default    guestbook-ui  Synced  Healthy            service/guestbook-ui created
apps   Deployment  default    guestbook-ui  Synced  Progressing        deployment.apps/guestbook-ui created
```

`argocd app sync` コマンドは、リポジトリからマニフェストを取得し、マニフェストの kubectl 適用する。これでアプリケーションがデプロイされた。

ブラウザでみるとどんなリソースが作成されているかという状況が分かる。

![Argo CD Deploy app](https://i.imgur.com/rv08uSh.webp)

## より GitOps を体験する

公式のチュートリアルとしては以上だが、いまいちこれだけだと雰囲気を掴めなかった。そこで先程利用した guestbook アプリケーションを使ってより GitOps を体験したいと思う。

やりたいこととしては、**マニフェストファイルを変更し、GitHub に push したら、自動でそれがクラスタに反映されデプロイされる**というところまでを試してみる！

まず自分のアカウントに fork する。

[ega4432/argocd\-example\-apps: Example Apps to Demonstrate Argo CD](https://github.com/ega4432/argocd-example-apps)

```shell
$ argocd app create my-guestbook --repo https://github.com/ega4432/argocd-example-apps.git \
    --path guestbook \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace default
application 'my-guestbook' created

$ argocd app sync my-guestbook
```

6-7 の手順をサクッと行って、新たに my-guestbook というアプリケーションをデプロイした。

> Argo CD has the ability to automatically sync an application when it detects differences between the desired manifests in Git, and the live state in the cluster. - ref. [Automated Sync Policy \- Argo CD \- Declarative GitOps CD for Kubernetes](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/)

とあるように Argo CD は、Git にある k8s マニフェストを正とし、クラスタの状態との差異を検出し、アプリケーションを自動的に同期する。

自動で同期するように設定する必要がある。

```shell
$ argocd app set my-guestbook --sync-policy automated
```

そして、下記のように `guestbook/guestbook-ui-deployment.yaml` のマニフェストファイルを修正し、リポジトリに push します。

```diff:guestbook/guestbook-ui-deployment.yaml
...
metadata:
  name: guestbook-ui
spec:
-  replicas: 1
+  replicas: 3
  revisionHistoryLimit: 3
  selector:
    matchLabels:
```

そして数分待つと、自動的に Deployment の ReplicaSet が 3 に増える！

```shell
$ k get pod -w
NAME                            READY   STATUS    RESTARTS   AGE
guestbook-ui-85985d774c-54kcw   1/1     Running   0          89s
guestbook-ui-85985d774c-9r4rq   1/1     Running   0          45m
guestbook-ui-85985d774c-zj99d   1/1     Running   0          89s
^C%

$ k get deploy
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
guestbook-ui   3/3     3            3           45m
```

ブラウザのダッシュボードを確認しても同様に Pod が 3 つに増えているのが分かる。

![Argo CD sync automatically](https://i.imgur.com/q2XG9Tl.webp)

## リソースの削除

全て終わったら使用したリソースを削除する。

```shell
$ argocd app delete guestbook -y
$ argocd app delete my-guestbook -y

$ k -n argocd delete -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

$ k delete ns argocd
```

## まとめ

今回は、Argo CD のチュートリアルに取り組んでみた。公式は分かりやすいが、簡単すぎるという印象も受けたので、各自で腹落ちする程度には触ってみるのがいいと思う。最近 GitOps という言葉をよく聞くので、もう少し触ってキャッチアップしておきたい。

## 参考

https://argo-cd.readthedocs.io/en/stable/getting_started/

https://github.com/argoproj/argocd-example-apps
