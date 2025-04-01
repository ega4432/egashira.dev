---
createdAt: "2025-03-30T06:30:00.000Z"
updatedAt: "2025-04-01T06:11:00.000Z"
summary: "asdf v0.16 では破壊的な変更が導入されており、既存の設定がそのままでは動作しなかったので、アップグレード手順をメモがてらまとめてみた。"
tags:
  - "asdf"
  - "macOS"
date: "2025-04-01"
draft: false
title: "asdf v0.16 にアップグレードする"
---

## はじめに

ある日、久しぶりに使った端末で npm のプロジェクトをローカルで動かそうとしたら、node.js が入っていないと怒られた。

```shell
$ node --version
zsh: command not found: node
```

原因を調べると、どうやら node.js の管理をしているバージョン管理ツール asdf 側の問題のようだった。

asdf は結構使っている人も多いのかなと思うのでメモとして残しておく。

## asdf を v0.16 にアップグレードする

下記の公式サイトを見て分かる通り、v0.16 で破壊的な変更が入ったみたいなので、その影響とのこと。

下記の手順で設定していけば問題なく使えるようになった。シェルは zsh を使っている前提なので、そこだけはお使いのシェルに置き換えて考えてもらえるといいと思う。

```shell
$ asdf --version
v0.14.0

$ brew upgrade asdf

$ asdf --version
asdf version 0.16.7

$ asdf info | grep -i data_dir
ASDF_DATA_DIR=/Users/ega4432/.asdf

$ echo "export $(asdf info | grep -i data_dir)" >> ~/.zshrc
$ echo 'export PATH="$ASDF_DATA_DIR/shims:$PATH"' >> ~/.zshrc

$ source ~/.zshrc

$ asdf reshim
```

### プラグインをインストール

プラグインは入れていたはずだが、`No plugins installed` と表示されて消えていそうだったのでインストールから行っていく。

```shell
$ asdf plugin list
No plugins installed

$ asdf plugin add nodejs

$ asdf install nodejs 20.17.0

$ node --version
v20.17.0

$ npm --version
10.8.2
```

## まとめ

今回、asdf を v0.16 にアップグレードする手順をメモがてらまとめてみた。v0.16 では破壊的な変更が導入されており、既存の設定がそのままでは動作しないケースがある。そのような状況に遭遇した場合は上記の手順をやると良い。

`asdf global/local` , `asdf update` などのサブコマンドなんかも多少変わっているので、詳しくは下記の公式サイトを参照して欲しい。

## 参考

[https://asdf-vm.com/ja-jp/guide/upgrading-to-v0-16](https://asdf-vm.com/ja-jp/guide/upgrading-to-v0-16)
