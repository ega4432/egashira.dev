---
createdAt: "2023-05-23T12:25:00.000Z"
updatedAt: "2023-12-13T14:27:00.000Z"
summary: "Ubuntu をクリーンインストールして開発マシンとして使ってみる上でやったことなど"
tags:
  - "Linux"
  - "Ubuntu"
date: "2023-12-13"
draft: false
title: "Ubuntu laptop の初期設定"
---

## はじめに

windows laptop が余っていたので Ubuntu をクリーンインストールして開発マシンとして使っている。その際に行った初期セットアップとしてやったことやその手順を自分用の備忘録としてメモしておく。

## OS のインストール

予めブートメディアを用意しておく必要がある。僕の場合は USB メモリを準備したので、その際の記事も貼っておく。

[https://egashira.dev/blog/create-ubuntu-bootable-usb](https://egashira.dev/blog/create-ubuntu-bootable-usb)

## 一般設定

### ロケール、タイムゾーン

マシンをデフォルトの英語で使用しているのでロケールはそのままで良いがタイムゾーンを日本に変える。

```bash
# ロケールの確認
$ localectl status | head -n 1
System Locale: LANG=en_US.UTF-8

# タイムゾーンを日本に変更
$ timedatectl set-timezone Asia/Tokyo
```

### 日本語入力

mozc を導入した。

```bash
$ sudo apt update
$ sudo apt install -y ibus-mozc
$ sudo reboot
```

再起動したら右上から日本語入力を設定できるか確認する。

### 詳細設定ツールのインストール

```bash
$ sudo apt update
$ sudo apt install -y gnome-tweaks
```

### **ファイアウォールの有効化**

```bash
$ sudo ufw enable

# ログを確認
$ tail -f /var/log/ufw.log
```

### キーバインド設定

Caps Lock を Ctrl にした。

```bash
sudo vi /etc/default/keyboard
```

以下のようにして再起動すれば設定が読み込まれる。

```bash
XKBOPTIONS="ctrl:nocaps"
```

## dotfiles を使ったセットアップ

こちらが基本的には初期セットアップの大半を占める。シェルの設定ファイルだったり、コマンドラインツールだったりを一気にインストールしてくれる。今後もゆるく育てていきたい。

```bash
$ /bin/bash -c "$(wget -qO - https://raw.githubusercontent.com/ega4432/dotfiles/main/install.sh)"
```

## ソフトウェアのインストール

dotfiles 化できていない、かつ普段から使用するソフトウェアを手動でインストールしていく。

### Google Chrome

以下よりダウンロードする。

[https://www.google.com/intl/ja/chrome](https://www.google.com/intl/ja/chrome/gsem/download/?brand=FDKM&gclid=CjwKCAjw1MajBhAcEiwAagW9MT00xS-RNiB14Il4xEMoM7Bwzq1FtBd_PaeBhrVa0xvg7lefQUkLMxoCmcQQAvD_BwE&gclsrc=aw.ds)[/gsem/download/](https://www.google.com/intl/ja/chrome/gsem/download/)

### 1Password

アプリは以下よりダウンロードする。

[https://1password.com/jp/downloads/linux/](https://1password.com/jp/downloads/linux/)

CLI もよく使うので、apt より op CLI を インストールした。

```bash
# インストール
$ sudo apt install -y 1password-cli

# CLI でアカウント追加、サインインする
$ op account add --signin
```

### Slack

以下から deb パッケージをダウンロードしてインストールした。

[https://slack.com/intl/ja-jp/downloads/linux](https://slack.com/intl/ja-jp/downloads/linux)

```bash
$ sudo apt install ~/Downloads/slack-desktop-{VERSION}-amd64.deb
```

## ターミナル設定

選択肢は色々あると思うが Ubuntu のデフォルトのターミナルを使っている。

プロンプトの設定については starship を使っているので starship 用の font ファイルをダウンロードする。以下より Hack Nerd Font をダウンロードして、`~/.fonts` に配置する。

https://www.nerdfonts.com/font-downloads

シェルは Bash を利用していて、dotfiles で bashrc, bash_profile を設定している。

## GitHub 接続設定

ここでは GitHub に push できるようにしておく。

SSH key の設定はこちらを参考にした。

[https://zenn.dev/lovegraph/articles/529fe37caa3f19](https://zenn.dev/lovegraph/articles/529fe37caa3f19)

`~/.ssh/config` を以下の内容で作成する。

```text
Host github github.com
  HostName github.com
  IdentityFile ~/.ssh/id_git_rsa
  User git
```

疎通確認する。

```bash
ssh -T github
Hi ega4432! You've successfully authenticated, but GitHub does not provide shell access.
```

ローカル用 config ファイル `~/.gitconfig.local` を作成

```text
[user]
		name = "ega4432"
			email = "xxxxxx+ega4432@users.noreply.github.com"
```

このファイルは、`~/.gitconfig` から以下のような形で読み込むようにしている。

```text
[include]
    path = ~/.gitconfig.local
```

## 参考

[https://lilaboc.work/archives/29007972.html](https://lilaboc.work/archives/29007972.html)

[https://qiita.com/outou_hakutou/items/ce06cb3c8c355d5fd87c](https://qiita.com/outou_hakutou/items/ce06cb3c8c355d5fd87c)

[https://sicklylife.jp/ubuntu/2004/settings.html](https://sicklylife.jp/ubuntu/2004/settings.html)

[https://zenn.dev/sprout2000/articles/8ea4a77d81583a](https://zenn.dev/sprout2000/articles/8ea4a77d81583a)
