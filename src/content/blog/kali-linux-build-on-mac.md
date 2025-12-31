---
title: VirtualBox を使って macOS 上に Kali Linux をインストールしてみた
date: "2022-05-08"
tags: ["Kali", "Linux", "Security"]
draft: false
summary: macOS 上に Kali Linux 環境を構築したメモ
images: []
---

## はじめに

今回はタイトルにある通り Kali Linux を macOS 上で動かしてみたかったので VirtualBox を使ってインストールしてみた。セットアップ方法について簡単にまとめる。

そもそも Kali Linux とは Wikipedia によると下記のようなペネトレーション用の OS を指す。

> Kali Linux（カーリー リナックス、カリ リナックス）はデジタル・フォレンジックやペネトレーションテスト用に設計された、Debian 派生の Linux ディストリビューションである。主に Offensive Security によって維持および資金援助されている。 - ref. [Kali Linux \- Wikipedia](https://ja.wikipedia.org/wiki/Kali_Linux)

さまざまなツールがプリインストールされていたり、ライブラリを追加するのも簡単だったりするので、セキュリティの勉強をするのに適していると評判がある。

## 使用した環境

- ホストマシン
  - macOS Monterey v12.2.1
- ハイパーバイザー型仮想化クライアント
  - VirtualBox v6.1.34

## VirtualBox のインストール

普通に [公式サイト](https://www.virtualbox.org/) からインストールしても良いのだが、CLI が楽なので Homebrew 経由で行う。

```sh
$ brew install --cask virtualbox
..
# 途中パスワードを聞かれたら入力する
==> Changing ownership of paths required by virtualbox; your password may be necessary.
🍺  virtualbox was successfully installed!

$ brew info virtualbox
virtualbox: 6.1.34,150636
https://www.virtualbox.org/
/usr/local/Caskroom/virtualbox/6.1.34,150636 (3 files, 119.6MB)
From: https://github.com/Homebrew/homebrew-cask/blob/HEAD/Casks/virtualbox.rb
==> Name
Oracle VirtualBox
==> Description
Virtualizer for x86 hardware
==> Artifacts
VirtualBox.pkg (Pkg)
==> Caveats
virtualbox requires a kernel extension to work.
If the installation fails, retry after you enable it in:
  System Preferences → Security & Privacy → General

For more information, refer to vendor documentation or this Apple Technical Note:
  https://developer.apple.com/library/content/technotes/tn2459/_index.html

==> Analytics
install: 8,241 (30 days), 27,649 (90 days), 137,579 (365 days)
```

`System Preferences → Security & Privacy → General` で言われた通り、システム環境設定を開き、開発元である Oracle America, Inc を許可し、PC を再起動する。

## Kali の VM をダウンロード

続いて Kali の VM を入手する。

[Kali の公式サイト](https://www.kali.org/) から Get Kali を開き、自身が使いたいものをダウンロードする。僕の場合は、VM を利用したかったので [Get Kali \| Kali Linux](https://www.kali.org/get-kali/#kali-virtual-machines) より VirtualBox 用のものをダウンロードした。

![Download Kali VM](https://i.imgur.com/LITahYG.webp)

## VirtualBox に Kali Linux をインポート

最後に、Kali を VirtualBox で起動できるようにする。

ダウンロードした ova ファイルをクリックすると VirtualBox が起動し、インポートのためのダイアログが表示される。

![Import Kali](https://i.imgur.com/SNdg5bp.webp)

必要があれば、作成するにあたり名前やフォルダーなどを任意のものに変更しインポートボタンをクリックする。

インポートが完了すれば（僕は数分かかった）、起動ボタンより VM を起動する。

VM が立ち上がると、Kali のログイン画面が表示される。

![login to Kali](https://i.imgur.com/DYJQKoN.webp)

[公式ドキュメント](https://www.kali.org/docs/introduction/default-credentials/) を確認したところデフォルトでは下記でログインできる。

- user: `kali`
- password: `kali`

![Kali desktop](https://i.imgur.com/VBxXjxr.webp)

ログインができ、無事に Kali Linux のデスクトップが表示できた。

画面左上に Firefox のロゴがあったので試しに開いてみると Web 画面が表示され、インターネットに接続できることも確認できた。

## まとめ

初めて Kali Linux を立ち上げてみた！

感想としては、非常に構築が容易でネット上にもかなり情報が出てくるので、何か詰まったとしても問題解決に困らなさそうだという印象を持った。
これで Kali を使用する準備ができたのでセキュリティの勉強をしたり、よく使われるツールを触ったりしてみたい。これからセキュリティについての勉強を始めるにあたり最初のステップとなるので是非参考にしてもらえると嬉しく思う。

## 参考

https://www.kali.org/

https://www.kali.org/docs/virtualization/

https://www.kali.org/docs/virtualization/install-virtualbox-guest-vm/
