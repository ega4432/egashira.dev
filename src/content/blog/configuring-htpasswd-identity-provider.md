---
title: OpenShift クラスタに htpasswd を使ってユーザを作成する
date: "2023-06-25"
tags: ["k8s", "OpenShift", "OAuth"]
draft: false
summary: OpneShift クラスタに最もシンプルにユーザを作成する方法の紹介
---

## はじめに

OpenShift クラスタを作った際、デフォルトでは kubeadmin ユーザが作成される。しかし、チーム内でこのクラスタを共有して作業する場合、みんなで kubeadmin を共有したくない。その場合、各メンバー分のユーザを作って管理する必要がある。

しかし、ちょっとした検証やテストのために外部の Identity Provider(IdP)を準備してとなると大変になってしまうので、そういったケースには htpasswd を使うと楽だと思う。

使用したクラスタのバージョンは以下の通り。

```bash
oc get clusterversion
NAME      VERSION   AVAILABLE   PROGRESSING   SINCE   STATUS
version   4.12.20   True        False         5d      Cluster version is 4.12.20
```

## htpasswd ファイルの作成

まずは、登録するユーザの情報を記載した htpasswd ファイルを作成する。

以下は `htpasswd` コマンドを使って `dev-users.htpasswd` というファイルを作成している例である。今回はテストということであたり障りのないユーザ名、パスワードで作成しているが、本来であれば桁数だったり、含める文字などを多くして複雑なパスワードにしておいたほうが良い。

```bash
# ex) htpasswd -c -B -b <ファイル名> <ユーザ名> <パスワード>

# 作成する場合
htpasswd -c -B -b dev-users.htpasswd alice pa55w0rd

# 追加する場合
htpasswd -b dev-users.htpasswd bob h0geh0ge
```

生成されたファイルを確認すると以下のような内容が記載されているはずだ。

```htpasswd:dev-users.htpasswd
alice:$2y$05$UF5GFgbhvr65KSYKr8EZhermFCGKj6XEzqR/1zkmgsY/FIxp55/.i
bob:$apr1$/eLa1rBD$kP7EMggu01Ol61qMunTjS/
```

## Secret の作成

それでは、先程作した htpasswd ファイルを元に Secret を作成していく。

```bash
oc create secret generic dev-users \
    --from-file=htpasswd=dev-users.htpasswd \
    -n openshift-config
```

この際に YAML に残しておきたい場合は、`--dry-run=client -o yaml` オプションで YAML ファイルとしておけばいいだろう。ただし、ユーザの認証情報が含まれるため取り扱いには注意が必要だ(今回は例のため全てマスクせずに表示している)。

```yaml:secret.yaml showLineNumbers
apiVersion: v1
data:
  htpasswd: YWxpY2U6JDJ5JDA1JFVGNUdGZ2JodnI2NUtTWUtyOEVaaGVybUZDR0tqNlhFenFSLzF6a21nc1kvRkl4cDU1Ly5pCmJvYjokYXByMSQvZUxhMXJCRCRrUDdFTWdndTAxT2w2MXFNdW5UalMvCg==
kind: Secret
metadata:
  name: htpasswd
  namespace: openshift-config
```

## OAuth クライアントの作成

最後に OAuth カスタムリソースを作成する。

```yaml:oauth.yaml showLineNumbers
apiVersion: config.openshift.io/v1
kind: OAuth
metadata:
  name: cluster
spec:
  identityProviders:
    - name: htpasswd_provider  # 任意の名前（ログイン画面に表示される名前になる）
      htpasswd:
        fileData:
          name: htpasswd  # 作成した htpasswd 用の secret の名前を指定
      mappingMethod: claim
      type: HTPasswd
```

```bash
oc apply -f ./oauth.yaml
```

## 確認

ここまで各リソースを作成できたら、OpenShift の Web Console を開いてみる。ログイン方法として、作成した htpasswd IdP が表示されていれば OK。テストで作成したユーザでログインできるか実際にやってみよう。

![OpenShift signin page](https://i.imgur.com/RZ8ZT5M.webp)

## cluster-admin 権限の付与

こちらは必要であれば実施する。

以下のように `oc adm` コマンドに追加したいユーザを指定してあげればよい。

```bash
oc adm policy add-cluster-role-to-user cluster-admin <ユーザ名>
```

もし、htpasswd ファイルに記載してあるユーザを全員追加したい場合は以下の Bash スクリプトを書いたので良かったら活用してもらうといいと思う。

```bash:assign-cluster-admin.sh showLineNumbers
#!/usr/bin/env bash

set -eu

me=$(oc whoami)
htpasswdFile="dev-users.htpasswd"

if [ "$me" != "kube:admin" ]; then
  echo "Required cluster-admin"
  exit 1
fi

echo -e "current user: ${me}\n"

cd "$(dirname "$0")"

if [ ! -e $htpasswdFile ]; then
  echo "$htpasswdFile file is not exist"
  exit 1
fi

cut -f 1 -d ":" "$htpasswdFile" | while read -r user
do
  echo "${user}"
  oc adm policy add-cluster-role-to-user cluster-admin "${user}"
done
```

## まとめ

以上 OpenShift クラスタにユーザを追加する方法として最もシンプルな方法である htpasswd Identity Provider を紹介した。
同じようなことが必要な方の参考になればと思う。

## 参考

[第 7 章 アイデンティティープロバイダーの設定 OpenShift Container Platform 4\.13 \| Red Hat Customer Portal](https://access.redhat.com/documentation/ja-jp/openshift_container_platform/4.13/html/authentication_and_authorization/configuring-identity-providers#configuring-htpasswd-identity-provider)
