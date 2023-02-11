---
title: Kubernetes クラスタで X509 クライアント証明書を使用してユーザを作成する
date: "2022-09-10"
tags: ["k8s", "Container", "security"]
draft: false
summary: Kubernetes クラスタにユーザを作成する方法の復習メモ
---

## はじめに

Kubernetes のユーザという概念には Service Account と通常のユーザ 2 種類がある。前者の Service Account が Kubernetes クラスタ内で管理されるオブジェクトである一方、後者の通常のユーザを管理する仕組みは Kubernetes にはなく、あくまでクラスタ内の認証局（CA）に署名された証明書を用いることで認証済みかどうかを判別する仕組みになっている。そこからさらに RBAC という仕組みでどういうリソースにどういう操作ができるかと詳細な制限をかけることができる。

今回はタイトルにある通り、2 種類のユーザのうち Service Account ではなく通常のユーザの作成方法についてまとめてみる。

## 今回利用する環境

- OS
  - macOS Monterey 12.4
- Kubernetes クラスタ
  - Docker Desktop for Mac
  - v1.24.0

```shell
alias k=kubectl
```

## クライアント証明書の作成

今回は、X509 クライアント証明書での認証を使用する。

### 秘密鍵の作成

まずは、PKI 秘密鍵とそれを元に証明書署名要求（CSR）を作成する。ここではユーザ名（CN）を `test` と指定している。

```sell
openssl genrsa -out test.key 2048

openssl req -new -key test.key -out test.csr -subj "/CN=test"
```

## CertificateSigningRequest の作成

kubectl を使って Kubernetes クラスタに CSR を作成する。作成する CSR オブジェクトの雛形は下記のようになっている。

```yaml:csr.yaml showLineNumbers
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: test
spec:
  request: # ここに CSR ファイルの内容を base64 エンコードした文字列をペーストする
  signerName: kubernetes.io/kube-apiserver-client
  usages:
    - client auth
```

普通に base64 した値をコピー & ペーストしてもいいが、yq コマンドを使用してワンライナーで csr.yaml を更新すると以下のようになる。

```shell
request="$(cat test.csr | base64 | tr -d "\n")" yq -i '.spec.request = strenv(request)' csr.yaml
```

CSR を作成してすぐに確認すると Pending になっていることが分かる。

```shell
k apply -f csr.yaml

k get csr
NAME   AGE   SIGNERNAME                            REQUESTOR            REQUESTEDDURATION   CONDITION
masa   4s    kubernetes.io/kube-apiserver-client   docker-for-desktop   <none>              Pending
```

作成した CSR を承認し、証明書を取得する。

```shell
k certificate approve test
certificatesigningrequest.certificates.k8s.io/test approved

k get csr
NAME   AGE   SIGNERNAME                            REQUESTOR            REQUESTEDDURATION   CONDITION
test   73s   kubernetes.io/kube-apiserver-client   docker-for-desktop   <none>              Approved,Issued
```

`kubectl certificate approve` を実行した後に再度確認すると Approved,Issued になったのが分かる。

## RBAC の設定

作成したユーザが Kubernetes クラスタにアクセスするためのロールとロールバインディングを作成する。

```shell
# Role
k create role test-role --verb=get --verb=list --resource=pods
role.rbac.authorization.k8s.io/test-role created

# Rolebinding
k create rolebinding test-binding --role test-role --user test
rolebinding.rbac.authorization.k8s.io/test-binding created
```

ここでは、Pod の情報取得という限定した権限を与えておく。

## kubeconfig に設定を追加

CSR から証明書を取得して、ユーザ情報として使用する。

```Shell
k get csr test -o jsonpath='{ .status.certificate }' | base64 -d > test.crt

# User
k config set-credentials test --client-key=test.key --client-certificate=test.crt --embed-certs=true
User "test" set.

# Context
k config set-context test --cluster=docker-desktop --user=test
Context "test" created.
```

Docker Desktop の Kubernetes クラスタを使用している場合 `~/.kube/config` に設定が追加される。

## 動作確認

事前に Pod を作成しておく。

```shell
k run nginx --image nginx

k get po
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          32m
```

`kubectl auth can-i` コマンド[^1]を使って test ユーザに権限があるかを確認する。

もちろん `kubectl config use-context` で context を切り替えて動作確認しても良い。

```shell
# Pod の一覧を取得
k auth can-i list pod --as test
yes

# Pod の詳細を取得
k auth can-i get pod --as test
yes

# Pod の作成
k auth can-i create pod --as test
no

# Pod の削除
k auth can-i delete pod --as test
no

# Service の一覧を取得
k auth can-i list service --as test
no

# Deployment の一覧を取得
k auth can-i list deployment --as test
no

# kube-system namespace の Pod の一覧を取得
k auth can-i list pod -n kube-system --as test
no
```

Pod の一覧取得はできるが、その他のリソースの操作や Pod に対しての他の操作ができないことも確認できた！

## まとめ

今回は、X509 クライアント証明書での認証を使用してユーザを作成する方法をまとめてみた。半年前くらい CKA の勉強でこの辺勉強したが忘れかけていたので復習がてらやってみた。
他にも OIDC トークンなどを使用した認証もできるので、他の認証方法についても調べてみたい。

## 参考

https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/#normal-user

https://kubernetes.io/docs/reference/access-authn-authz/rbac/

[^1]: kube-apiserver へリクエストをチェックし、ユーザがアクセスできるか認可をデバッグできる。[Checking API Access | Kubernetes](https://kubernetes.io/docs/reference/access-authn-authz/authorization/#checking-api-access)
