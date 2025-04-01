---
createdAt: "2025-03-29T07:36:00.000Z"
updatedAt: "2025-04-01T04:48:00.000Z"
summary: "CKS に合格したので、受験に至るまでの学習内容や受験してみての感想などをまとめる。"
tags:
  - "k8s"
  - "security"
  - "Certification"
  - "Tips"
date: "2025-03-30"
draft: false
title: "Certified Kubernetes Security Specialist に合格した"
---

## はじめに

タイトルの通り Certified Kubenetes Security Specialist 通称 CKS に合格したので、受験に至るまでの学習内容や受験してみての感想などをまとめる。

ちなみに合格したのは 2025 年 2 月中旬になるので、この記事を書いている時点で既に 1 ヶ月くらい前のことになってしまった点はご容赦いただきたい。

## 試験の概要

まず知らない方のために本資格 CKS について補足しておく。

CKS とは、Linux Foundation という団体が提供している Kubernetes（以下 k8s） に関わるセキュリティについての資格試験の一つである。

[https://training.linuxfoundation.org/ja/certification/certified-kubernetes-security-specialist/](https://training.linuxfoundation.org/ja/certification/certified-kubernetes-security-specialist/)

同団体が提供している k8s 資格には、他にも k8s 管理者向けの [CKA](https://training.linuxfoundation.org/ja/certification/certified-kubernetes-administrator-cka/) や k8s 上でのアプリ開発向けの [CKAD](https://training.linuxfoundation.org/ja/certification/certified-kubernetes-application-developer-ckad/) など（他にも入門者向けの資格試験もある）が存在する。

僕自身については前述した 2 つの資格を約 2 年前に取得済みという状況だった。（過去に書いたブログ記事があるのでもし興味のある方は参照して欲しい）

[https://egashira.dev/blog/cka-ckad-exam](https://egashira.dev/blog/cka-ckad-exam)

資格の注意点にも 2 点ほど触れておく。

1 つ目は、CKS を受けるためには前述した CKA の取得が前提となること。

2 つ目は、いずれの資格試験も有効期限が 2 年と短いこと。k8s の変化は激しく、日々新しい機能がリリースされるという特性上仕方ないとも思う。

ちなみに 1 点目について朗報だが、2024 年の update で CKA の有効期限は問わないという変更が入った。[こちら](<https://training.linuxfoundation.org/ja/blog/cks-exam-to-update-september-12-2024/#:~:text=%E8%B3%87%E6%A0%BC%20Certified%20Kubernetes%20Security%20Specialist%20(CKS)%20%E3%82%92%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%99%E3%82%8B%E3%81%9F%E3%82%81%E3%81%AE%E5%89%8D%E6%8F%90%E6%9D%A1%E4%BB%B6%E3%81%8C%E6%9B%B4%E6%96%B0%E3%81%95%E3%82%8C%E3%80%81%E5%8D%B3%E6%99%82%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%AA%E3%82%8A%E3%81%BE%E3%81%97%E3%81%9F%E3%80%82%E8%A9%A6%E9%A8%93%E3%82%92%E4%BA%88%E7%B4%84%E3%81%99%E3%82%8B%E3%81%9F%E3%82%81%E3%81%AB%E3%80%81%E3%82%A2%E3%82%AF%E3%83%86%E3%82%A3%E3%83%96%E3%81%AA%20%E8%AA%8D%E5%AE%9AKubernetes%E7%AE%A1%E7%90%86%E8%80%85%EF%BC%88CKA%EF%BC%89%E8%A9%A6%E9%A8%93%E3%81%AF%E5%BF%85%E8%A6%81%E3%81%82%E3%82%8A%E3%81%BE%E3%81%9B%E3%82%93%E3%80%82%E3%81%84%E3%81%A4%E3%81%A7%E3%82%82%20CKA%20%E3%82%92%E4%BF%AE%E4%BA%86%E3%81%97%E3%81%A6%E3%81%84%E3%82%8C%E3%81%B0%E5%A4%A7%E4%B8%88%E5%A4%AB%E3%81%A7%E3%81%99%E3%80%82>)に記載の通り 1 度 CKA に合格していれば CKA の有効期限が過ぎていても受験資格が得られるとのこと。

また、他の受験経験者もよく言われていることだが、本資格の難易度は非常に高かった。本資格の試験バウチャーには 1 回の retake 権が与えられる（つまり一度落ちてももう一度だけ受験可能）が、何を隠そう僕も一度不合格となり、二度目でようやく合格することができた。

僕の知識レベルや経験的な面を言及すると、会社の所属組織で新卒向けのコンテナ技術の基礎（Docker, k8s, etc …）講師を担当していたり、実業務でも k8s を使う場面は多々ある。一方で、CKS の範囲となる k8s のセキュリティの機能までは使ったことがなかったり、セキュリティという分野においても知識が特別ある訳ではなかった。

## 学習リソース

続いては、実際に僕が学習に使ったリソースを使用した順番で紹介していく。

### 書籍

まずはこちらの「Docker/Kubernetes 開発・運用のためのセキュリティ実践ガイド」を読んでインプットした。

[https://amzn.to/3XFUaro](https://amzn.to/3XFUaro)

CKS に特化した書籍ではないが、こういう普遍的な内容が個人的には一番最初に学習しておけると助かる思った。また、次の Udemy 講座しかりまだまだ英語のリソースが多い中で日本語で読めるということでまずは手にとってもらえると良いのではないかと思う。

受験後に知ったのだが、下記の本もタイトル的には CKS の受験対策に向いていそう。

[https://amzn.to/43zIeuW](https://amzn.to/43zIeuW)

### Udemy

上記の書籍と並行してこちらの講座を受講した。

[https://www.udemy.com/course/certified-kubernetes-security-specialist-certification/](https://www.udemy.com/course/certified-kubernetes-security-specialist-certification/)

動画の視聴方法としては、とりあえず 1.5 倍とかにしてあまり時間をかけずに知らない内容のインプットとしてざっと流した。一通りの試験範囲の特定と知らない知識の特定を行った。

また、Digital Ocean というサイトの割引コードが配布されていたのでアカウントを作って k8s 環境を作って、実際にコマンド叩いて試したりを繰り返し行った。

### Killercoda

続いてはこちらのサイトで学習した。

[https://killercoda.com/killer-shell-cka](https://killercoda.com/killer-shell-cka)

k8s 環境が用意された上で、全 41 個のシナリオをこなしていくということで実践形式で学ぶことができた。こちらについてもまだ知識が定着している段階ではないので、答えを見ながら手に馴染むようにどんどんコマンドを叩いてを繰り返し 2 周実施した。

### Killer Shell

最後が試験バウチャーを購入するともれなく付いてくるこちらのサイト。

[https://killer.sh/cks](https://killer.sh/cks)

こちらは試験シュミレータサイトになっていて 1 回 36 時間の k8s 環境を 2 回利用できる。問題は 20-30 問ほどあり、かなり網羅的で試験本番のレベルに一番近いと感じた。

おすすめのタイミングとしては、一通り試験内容を学習して、試験直前に取り組むのがいいと思う。

僕は一度不合格になったと前述したが、二度目の受験前に約 10 ドル支払うことで再度シュミレータを払い出すことができることを知ったので課金した。

## まとめ

CKS を受験した感想などをまとめておく。

繰り返しになるが 2 回目で合格はできたものの非常に難しい試験だったと思う。その学習過程は、知らないことに何度も遭遇し非常に勉強になったし、今後の業務やキャリアにおいて大いに役に立つ財産になったのではないかと実感している。

資格取得が揶揄されるエンジニア界隈ではあるが、Linux Foundation が提供する k8s 認定については手を動かして時間内に問題を解き切るというような謂わば RTA のような要素が満載である(笑)

ゲーム感覚で非常に楽しいし、何より暗記ゲーのような資格よりは実際に手を動かして学べるのは価値があると思う。

最後に雑談になるが、合格後に [Kubestronaut プログラム](https://training.linuxfoundation.org/ja/resources/kubestronaut-program/)と言うものの存在を知った。僕の場合、CKA, CKAD の期限が本記事執筆時には既に切れてしまっているので目指すのは諦めようと思うが、今回 CKS に合格できたことで実質レベルとしては認定されてもいてもおかしくないレベルまでこれたのだということが何より嬉しい。

これからも k8s 周辺の技術はもちろん、それだけに留まらず情報発信をしていきたい。

## 参考

[https://training.linuxfoundation.org/ja/certification/certified-kubernetes-security-specialist/](https://training.linuxfoundation.org/ja/certification/certified-kubernetes-security-specialist/)

[https://training.linuxfoundation.org/ja/blog/cks-exam-to-update-september-12-2024/](https://training.linuxfoundation.org/ja/blog/cks-exam-to-update-september-12-2024/)

[https://amzn.to/3XFUaro](https://amzn.to/3XFUaro)

[https://amzn.to/43zIeuW](https://amzn.to/43zIeuW)

[https://www.udemy.com/course/certified-kubernetes-security-specialist-certification/](https://www.udemy.com/course/certified-kubernetes-security-specialist-certification/)

[https://killercoda.com/killer-shell-cka](https://killercoda.com/killer-shell-cka)

[https://killer.sh/cks](https://killer.sh/cks)
