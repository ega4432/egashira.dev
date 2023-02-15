---
title: Google Domains で取得したドメインにエイリアス設定しメールを送受信する
date: '2022-05-05'
tags: ['Google Domains', 'Email', 'SaaS', 'Tips']
draft: false
summary: Google Domains で取得したドメインをメールアドレスとして使用するための設定をしてみたので手順をまとめる
---

## はじめに

[Top 画面](https://egashira.dev) にメールのアイコンを置いているが、そこでは Google Domains で取得したドメインを使ったメールアドレスを使用している。自身で取得したドメインをメールアドレスとして使用する際に、初めて設定したので手順をまとめてみた。

## 前提

前提としては、Google Domains でドメインを取得している状態で進めていく。また、Google Workspace は契約せずに無料で済ませることとする（現時点では、Google Workspace の個人プランで Gmail の独自設定はできないため、もし Workspace を契約するにはビジネスプランを選択する必要がある[^1]）。

## 今回のゴール

最終的に、次の状態になることを目標として進める。

- Google Domains で取得したドメインのメールアドレスでメールを受信し、Gmail 上で確認できる。
- Gmail を使って、Google Domains で取得したドメインのメールアドレスからメールを送信できる。

## 受信設定

[マイドメイン](https://domains.google.com/registrar/)を開き、設定したいドメインの「管理」をクリックし、サイドバーの「メールアドレス」を選択する。

### エイリアス設定

以下の画像のように「メール転送」の「エイリアスの追加」から設定したいメールアドレスを入力する。

- エイリアスメール：`<使用したいエイリアス>`
- 既存の受信者のメールアドレス：`<使用するメールアドレス>`

![Google Domains > email](https://i.imgur.com/VoJLNia.webp)

僕の場合は、「既存の受信者のメールアドレス」には既存の Gmail アドレスを使用した。

### メールを送信して確認

上記で設定した `hello@egashira.dev` にメールを送り、Gmail 上で受信できるか確認してみる。

![check Gmail](https://i.imgur.com/fhWw5Fj.webp)

任意のメールアドレスから、今回エイリアスを設定した `hello@egashira.dev` でメールを受信できた。

## 送信設定

Google Domains で取得したドメインで受信できたので、続いて Gmail の UI を使ってメールを送信できるようにする。

### 事前準備

アプリのパスワードを生成する必要があるが、その前に 2 段階認証を未設定の場合は[こちらから](https://myaccount.google.com/security)設定する。

2 段階認証を設定すると、「アプリパスワード」という項目が出現するのでこちらから進める。

![apppasswords](https://i.imgur.com/UMEAdSf.webp)

### アプリパスワードの作成

「アプリを選択」では**その他**を、名前には自分があとから見ても分かりやすい名前を付ける（私の場合は `egashira.dev のメールアドレス` とした）。

![app passwords](https://i.imgur.com/uIoRP94.webp)

作成できたら黄色の網掛け部分にパスワードが表示されるのでコピーし保存しておく。

![app passwords2](https://i.imgur.com/Aw5bJEK.webp)

### エイリアス設定

続いて送信用のエイリアスを設定する。

Gmail の画面の右上の歯車マークから設定を開き、「すべての設定を表示」から、「[アカウントとインポート](https://mail.google.com/mail/u/0/#settings/accounts)」を開く。

![accounts](https://i.imgur.com/x2vhE3O.webp)

「他のメールアドレスを追加」から追加設定に進む。

![Add other email](https://i.imgur.com/BJyb9dm.webp)

名前には任意の名前を、メールアドレスにはドメインを使ったメールアドレスを入力する。

![Add other email2](https://i.imgur.com/bMCIxiN.webp)

SMTP サーバーの設定は次のようにする。

- SMTP サーバー：`smtp.gmail.com`
- ポート：`465`
- パスワード：`<作成したアプリパスワードを入力>`

![Add other email3](https://i.imgur.com/dPpk0jh.webp)

### メールを送信して確認

実際に設定した Google アカウントからメールを送信して Google Domains で取得したドメインから送られるか確認する。

![Successfull sending](https://i.imgur.com/Od7IUb0.webp)

受信したメールを見てみると、From に Google Domains のメールアドレスが設定されている。

## まとめ

Google Domains で取得したドメインにエイリアスを設定してメールの送受信をできるようにした。個人で使用する程度だと Google Workspace に契約することなく、サクッと設定できて便利！

[^1]: [Google Workspace に個人事業主・フリーランス向けプラン Individual が登場！他プランとの違いも解説   \| よしづみコラボラボ](https://www.yoshidumi.co.jp/collaboration-lab/gws_individual01/)
