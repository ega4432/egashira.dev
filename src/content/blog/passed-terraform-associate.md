---
title: "Terraform Associate に合格した"
date: "2025-07-06"
tags: ["Terraform", "Certification", "Hashicorp"]
draft: false
summary: "Terraform Associate を受験した際の学習方法や受験体験、感想などをまとめる。"
---

## はじめに

Terraform Associate は HashiCorp 社が提供する公式認定資格であり、Terraform の基本的な知識と実践スキルを問う試験である。
試験範囲など詳細は公式サイトを参照してほしい。

https://www.hashicorp.com/certification/terraform-associate

私は、訳あって試験のバウチャーコードをいただけたので受験してみた。この記事では、私が実際に受験した経験をもとに、学習方法や試験の予約から受験までの流れ、感想などをまとめてみる。

## 学習について

### 動画視聴

まずは何はともあれ Udemy の下記コースを受講しておくと良い。

https://click.linksynergy.com/deeplink?id=aWRSbM3RHks&mid=47984&murl=https%3A%2F%2Fwww.udemy.com%2Fcourse%2Fterraform-beginner-to-advanced

最後のセクションに Practice Test がいくつか用意されているが、それを実施した際の私のスコアを参考に書いておく。
`テスト名 - 正答数/問題数 (正答率)` 形式で記載する。

- Practice Test 1 - 15/22 (68%)
- Practice Test 2 - 26/32 (81%)
- Practice Test 3 - 24/31 (77%)
- Practice Test 4 - 23/30 (76%)
- Practice Test 5 - 19/26 (73%)
- Practice Test 6 - 28/42 (67%)
- Practice Test 7 - 48/60 (80%)

私は時間がなく断念したが、下記のコースも時間に余裕があれば取り組んでおくと、より十分に対策ができると思う。

https://click.linksynergy.com/deeplink?id=aWRSbM3RHks&mid=47984&murl=https%3A%2F%2Fudemy.com%2Fcourse%2Fterraform-associate-practice-exam

### 書籍

動画視聴に比べるとややスピードが落ちる学習法かもしれないが、書籍での学習も効果的である。私が過去読んだことのある書籍についても紹介するので興味があればぜひ手に取ってもらいたい。

https://amzn.to/4lEVnt5

https://amzn.to/4jdqAlE

### 実機検証

エンジニアであれば触ってみるのが一番ということで、多少時間がかかるもののこの方法もおすすめである。実機での検証は理解を深める上で非常に有効だ。

特に Terraform 経験の浅い方は、実際にクラウド環境に対して Terraform でリソースの作成や変更、削除を体験しておくことは控えめに言っても必須かなと思う。

下記のチュートリアルから経験のあるクラウドをベースに実施してみると良い。また、手を動かす際は、公式ドキュメントを読みながらパラメータを調べたり、返り値としてどういう値が返却されるかなどを見ながら実装する習慣を身につけておくと良いと思う。

https://developer.hashicorp.com/terraform/tutorials

https://developer.hashicorp.com/terraform/docs

## 試験について

### 予約

Terraform Associate の試験予約は Certiverse というサイトにアカウントを登録した上で行う。

https://www.certiverse.com/

注意点としては、Certiverse のアカウント名は身分証明書と突合するためフルネームかつ本名にしておく必要がある。

また、もしバウチャーコードを持っている場合は、日付・時間を決めた後にバウチャーコードを入力する欄が出てくるのでそこで適用させる。

受験日から 48 時間前(3 営業日前)であればリスケも可能である。

この記事では語りきれないこともあるので、必ず公式の下記ページを確認しておくこと。

https://hashicorp-certifications.zendesk.com/hc/en-us/articles/26234761626125-Exam-appointment-rules-and-requirements

### 受験直前の準備

受験する直前だが、接続確認などで苦戦する可能性があるため、30 分前くらいから準備を始めるのがおすすめである。

そして、システム要件などをもう一度確認しておく。

https://hashicorp-certifications.zendesk.com/hc/en-us/articles/26234761626125-Exam-appointment-rules-and-requirements

受験も Certiverse から実施するのでブラウザで Certiverse にログインしておく。

顔写真付きの身分証明書（英語表記が必要なので日本人は基本パスポートとなる）を準備しておく。

ブラウザ以外のアプリは終了し、Chrome や Slack などの通知も一時的に停止しておくと安心だと思う。

### 受験

試験を開始すると、まずプロクター（監督者）とチャット形式でやりとりを行うことになる。試験問題は日本語化されないが、チャットは日本語に変更可能である。

まずは、身分証明書のチェックや受験環境（机・部屋周り）のチェックから始まる。

部屋を映す際には、外付けカメラはほぼ必須だと思う。なぜなら、ない場合はラップトップを持ち上げて部屋全体を映すという軽い筋トレを行うことになる。

余談だが、筆者が受験したことのあるオンライン試験（具体的には Kubernetes 系）と比べると環境のチェックは比較的ゆるく、膝の上や PC の下、イヤホンの有無、腕時計のチェックなど細かい確認はなかった。

それ以降は、適当に指示に従っていればスムーズに試験が始まる。

## まとめ

最後に試験の感想を述べておくが、Associate 資格ということもあり、決して難しい内容ではなく、広く Terraform に関する知識を確認するような内容だったかなと思う。

試験時間は数分を残した程度で割と時間いっぱい使った。見直しまで一通り済んだ後にもうこれで良いかなと思って End Exam ボタンを押した直後、画面に `Pass` と結果が表示されたときは不意打ちを食らったが、無事に合格することができ何よりだった。

Credly へのバッジ付与や詳細な結果は 48 時間以内に対応されるが、点数までは開示されないらしい。残念。

簡単ではあったが、Terraform Associate を受験の経験談と感想は以上である。この記事が同資格試験の受験を検討している方の参考になればと思う。

## 参考

https://www.hashicorp.com/certification/terraform-associate

https://developer.hashicorp.com/terraform/docs

https://qiita.com/luigibanzai/items/57b377ba09f662b64389

https://blog.usize-tech.com/how-to-pass-terraform-associate/

https://zenn.dev/yuta1995/scraps/8a03fc473b5348
