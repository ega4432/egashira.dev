---
title: "Kubernetes 技術者認定 CKA/CKAD を取得したので振り返る"
date: "2022-04-09"
tags: ["k8s", "CKA", "CKAD", "Certification", "Tips"]
draft: false
summary: "Linux Foundation が提供している Certified Kubernetes Administrator / Application Developer の受験にあたり行ったことや学んだことなどをまとめる"
---

## **2022 年 6 月に行われた受験方式の変更について**

**僕が受験した後に、受験方式が大幅に変更されたためこちらの記事を見てくださった方のために誤解のないように追記する。
具体的には Chrome ブラウザで受験ができていたものが、独自ブラウザをインストールする必要があったり主に環境面での変更が行われた。**

[Update on Certification Exam Proctoring Migration \- Linux Foundation \- Training](https://training.linuxfoundation.org/blog/update-on-certification-exam-proctoring-migration/)

**詳しくは、上記リンク先を参照しつつ新方式に向けた準備をしてもらえればと思う。本記事で書いていたが、新方式で意味をなさなくなったものについてはその旨を記載しておく。**

## はじめに

2022 年 2 月に Certified Kubernetes Administrator（以下 CKA）、同年 4 月に Certified Kubernetes Application Developer（以下 CKAD）に合格した。おそらく 3 年後もエンジニアとして働いていたら受験する可能性が高いので自分のためにも残しておく。

受験した感想としては、Kubernetes 初学者である自分にとって学習体験が良く、非常に楽しみながら学習できた。

## CKA/CKAD のそれぞれの位置づけ

2022 年 4 月現在では、試験の出題範囲とそれぞれ配分については下記のようになっている。

**CKA**

- ストレージ: 10%
- トラブルシューティング: 30%
- ワークロードとスケジューリング: 15%
- クラスタのアーキテクチャ、インストール、構成: 25%
- サービスとネットワーキング: 20%

**CKAD**

- アプリケーションの設計と構築: 20%
- アプリケーションの展開: 20%
- アプリケーションの可観測性とメンテナンス: 15%
- アプリケーション環境、構成、およびセキュリティ: 25%
- サービスとネットワーキング: 25%

受験したイメージだが、こちらの Qiita 記事[^1]と同じ印象を受けた。CKAD よりも CKA の方が試験範囲は広いものの、どちらも同じくらいの難易度だと感じた。

受験した順番も CKA -> CKAD の順に受けた（両方受けるなら個人的にはこの順番がおすすめ）ので、CKAD を受ける際にはある程度 CKA で得た知識を活用できたということも大きい。

## 学習に利用したもの

### Udemy

基本的には以下の Udemy 講座をベースに対策した。他にも合格体験記事を調べるとだいたいの方がこちらを購入されているようだった。内容としては Lab 環境を利用したハンズオン形式かつ最後には本番を想定した Mock Exam がいくつか用意されている。これをやり込めば知識として基本的なことは習得できるので、個人的には現段階で最も優秀な教材だと思う。

- [Certified Kubernetes Administrator \(CKA\) Practice Exam Tests \| Udemy](https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/)
- [Kubernetes Certified Application Developer \(CKAD\) Training \| Udemy](https://www.udemy.com/course/certified-kubernetes-application-developer/)

### 書籍「Kubernetes 完全ガイド 第２版」

言わずと知れた k8s の完全ガイド。分厚く解説も丁寧なので全部を読むというよりは辞書的に知りたいことについて読み込むようにして利用した。

[Kubernetes 完全ガイド 第 2 版 impress top gear シリーズ \| 青山真也 \| 工学 \| Kindle ストア \| Amazon](https://www.amazon.co.jp/dp/B08FZX8PYW)

### Killer.sh

Linux Foundation で試験バウチャーを購入すると、Killer.sh というサイトの試験シュミレータを無料で利用できる。1 回 36 時間のクラスタを 2 回利用できるので、Udemy 講座で学んだ後、試験直前に取り組むのがいいと思う。また、こちらのシュミレータの問題は難しめに設計してあるので、この問題に慣れておけば本番でもだいぶ適応できると思う。

https://killer.sh/

## 受験に際しての Tips

### ~Chrome Profile の作成~

❗ 2022 年 6 月の試験方式変更に伴い、独自ツールをインストールの上受験することになったため不要。

~試験はブラウザで受験する訳だが、普段使用している Chrome Profile だと拡張機能だったりブックマークだったり試験では不要なものが多いため試験のためだけの Profile を用意した。~

### ~Chrome ブックマークの作成~

❗ 2022 年 6 月の試験方式変更に伴い、独自ツールをインストールの上受験することになったため不要。

~Profile に次いで、ブックマークも準備した。以下の URL は試験時も閲覧可能だが、いちいち検索する時間ももったいないので Chrome のブックマークを強化しておくのが良いだろう。~

- ~https://kubernetes.io/docs/~
- ~https://github.com/kubernetes/~
- ~https://kubernetes.io/blog/~

~ブックマークをいちから作るのは流石に骨が折れるので、僕は下記をインポートして活用した。Mock Exam などに取り組む過程で必要そうなページは都度追加して自分なりのブックマークを準備した。~

~[kubernetes/Kubernetes\-Chrome\-Bookmarks\.html at main · sidd\-harth/kubernetes](https://github.com/sidd-harth/kubernetes/blob/main/Kubernetes-Chrome-Bookmarks.html)~

### エイリアス設定

`kubectl` コマンドを何度も叩くことになるので、エイリアスを設定しておくのがおすすめ。クラスタによってはデフォルトで設定されていることもあるが、気づけばもはや手癖で設定するレベルになっていた笑

```shell
$ alias k=kubectl

$ k version --short
Client Version: v1.22.1
Server Version: v1.22.1

$ export do="--dry-run=client -o yaml"

$ k run pod1 --image=nginx $do
```

### kubectl でリソースのドキュメントを確認

explain サブコマンドが便利。YAML の書き方がわからなくなった場合、ドキュメントを調べるよりもこちらのほうが早い時も多々ある。

```shell
$ k explain pod

# --recursive オプションを付けるとネストしたオブジェクトも全て参照できる
$ k explain --recursive pod

# "." で繋げることでオブジェクトのフィールドを指定できる
$ k explain pod.spec

# 僕はよく less に流し込んで使っていた
$ k explain --recursive pod | less
```

### リソースのショートネームを使う

k8s のリソースには、Pod だと `po`、ConfigMap だと `cm`、PersistentVolumeClaim だと `pvc` のようにショートネームが定義されている。コマンドで使用する場合はショートネームを使うと時間を短縮できる。

```shell
# api-resources サブコマンドを使うとどういうショートネームが定義されているか確認できる
$ k api-resources | head -n 10
NAME                              SHORTNAMES   APIVERSION                             NAMESPACED   KIND
bindings                                       v1                                     true         Binding
componentstatuses                 cs           v1                                     false        ComponentStatus
configmaps                        cm           v1                                     true         ConfigMap
endpoints                         ep           v1                                     true         Endpoints
events                            ev           v1                                     true         Event
limitranges                       limits       v1                                     true         LimitRange
namespaces                        ns           v1                                     false        Namespace
nodes                             no           v1                                     false        Node
persistentvolumeclaims            pvc          v1                                     true         PersistentVolumeClaim
```

### できるだけ kubectl コマンドワンライナーでリソースを作成、変更する

```shell
# シングルコンテナな Pod を作る
$ k run pod1 --image=nginx:alpine

# nginx Deployment の nginx コンテナのイメージを変更
$ k set image deployment/nginx nginx=nginx:1.9.1
```

その他にも secret, configmap は create サブコマンドで、service だと expose サブコマンドで作成できる場合もよくある。リソースを作成する場合は、このコマンドで作れるなとパッと思い浮かぶようになっておけば良いだろう。

## 試験時の環境と注意点

### デスク周り

本番の試験については自宅で受験した。環境としては利用できるものは利用し、いつもの作業環境に近い環境で臨んだ。

- MacBook Pro 13-inch
- 外部ディスプレイ 1 枚
- 外付けキーボード
- Magic Trackpad
- 外付け Web カメラ

困ったこととしては、外付けの Web カメラを Mac に接続していたのに Mac の方のカメラが優先され上手く認識されなかった。仕方なく Mac を持ち上げてあたりを映して乗り切ったが、これはどうにか解決したい…。

### ID

身分証明には下記で問題なかった。

- 運転免許証
- クレジットカード

### 事前に確認しておくべきもの

https://docs.linuxfoundation.org/tc-docs/certification/lf-handbook2/candidate-requirements

https://www.youtube.com/watch?v=9UqkWcdy140

## まとめ

今回は Certified Kubernetes Administrator（CKA）、Certified Kubernetes Application Developer（CKAD）の受験について振り返ってみた。学習する過程で手を動かしながら楽しんで学ぶことができた。結果として、Kubernetes についての知識を確認もできたので良かったと思う。次回は年内を目処に CKS にも挑戦してみたい。

[^1]: [Kubernetes 認定資格 CKA/CKAD 受験の Tips \- Qiita](https://qiita.com/mochizuki875/items/a77d5c495d2fb99bd2f9) にある試験範囲のイメージ図が分かりやすかった。
