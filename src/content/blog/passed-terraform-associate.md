---
title: Terraform Associate に合格した話と受験体験記
date: "2025-07-05"
tags: [Terraform, 資格試験, Terraform Associate, 合格体験]
draft: false
summary: Terraform Associate の概要、勉強方法、受験体験、合格後の感想をバランスよくまとめた記事です。
---

Terraform Associate に合格した話と受験体験記

## はじめに

Terraform Associate は HashiCorp が提供する公式認定資格であり、Terraform の基本的な知識と実践スキルを問う試験である。
詳細は公式サイトを参照してほしい。

https://www.hashicorp.com/certification/terraform-associate

この記事では、私が実際に受験し合格した経験をもとに、試験の範囲、予約から受験までの流れ、学習方法、試験の感触、合格後の感想をバランスよくまとめる。

## 試験範囲

Terraform Associate 試験は、Terraform の基本的な操作からインフラのコード化（IaC）に関する知識まで幅広く問われる。
主な試験範囲は以下の通りである（公式サイトより引用）。

- Terraform の基本的な概念とワークフローの理解
- Terraform の設定ファイル（HCL）の記述と管理
- リソースの作成、変更、削除の操作
- 状態管理（State）の理解と操作
- モジュールの利用と管理
- Terraform Cloud や Terraform Enterprise の基本的な機能理解
- インフラのセキュリティやベストプラクティスの理解

詳細は公式サイトの試験ガイドを参照して欲しい。

https://learn.hashicorp.com/tutorials/terraform/certification-associate

## 試験の予約〜受験

Terraform Associate の試験予約は Certiverse から行う。
GitHub のアカウントでログイン可能である。
Certiverse のアカウント名は身分証明書と突合するためフルネームにしておく必要がある。
日付・時間を決めた後にバウチャーコードを入力すると無料で受験できる。
受験日から 24 時間以上空いていれば（前日までなら）リスケも可能である。

受験前にシステム要件などを一通り確認しておく。
受験当日は Certiverse のサイトから受験する。
身分証明書（英語表記が必要なので日本人は基本パスポートが推奨）を準備しておく。
接続確認などで苦戦する可能性があるため、30 分前くらいから準備を始めるのがおすすめである。
ブラウザ以外のアプリは終了し、Chrome や Slack などの通知も止めておく。

プロクター（監督者）とのやりとりはチャット形式で行う。
日本語に変更可能である。
身分証明書のチェックや机・部屋のチェックがある。
外付けカメラはほぼ必須で、ない場合は PC を持って部屋全体を映す必要があり大変である。
Kubernetes 系の試験と比べると監視は比較的ゆるく、膝の上や PC の下、イヤホンの有無、腕時計のチェックなど細かい確認はない。
指示に従っていればスムーズに試験が始まる。

## Terraform の学習について

事前学習として Udemy の指定コースを受講しておくと良い。
https://udemy.com/course/terraform-beginner-to-advanced/

私の模擬試験スコア例は以下の通りである。

- Practice Test 1 - 15/22 (68%)
- Practice Test 2 - 26/32 (81%)
- Practice Test 3 - 24/31 (77%)
- Practice Test 4 - 23/30 (76%)
- Practice Test 5 - 19/26 (73%)
- Practice Test 6 - 28/42 (67%)
- Practice Test 7 - 48/60 (80%)

時間に余裕があれば Practice Exam も受けておくと安心である。
https://udemy.com/course/terraform-associate-practice-exam
私は時間がなく断念した。

## 試験の感触

試験時間は 1 時間で 57 問あった。
全問選択式で、1/4 や 2/4 のように複数選択肢から選ぶ形式で Udemy の模擬試験と同じ形式である。
英語力が十分でないと時間がギリギリになることもある。
「not」や「never」など逆の意味を問う問題があるため、凡ミスに注意が必要である。
自信のない問題にはフラグを付けて後で見直しやすくできる。
試験終了後すぐに結果が表示され、不意打ちを食らった。
バッジ付与や詳細な結果は 48 時間以内にメールで届く。

## 合格後の感想

実務での Terraform 利用経験が合格の自信につながった。
試験を通じて Terraform の理解が深まり、インフラ自動化の幅が広がった。
Terraform Associate はスキル証明としてキャリアアップに役立つと感じている。

## まとめ

この記事が Terraform Associate の受験を検討している方の参考になれば幸いである。
