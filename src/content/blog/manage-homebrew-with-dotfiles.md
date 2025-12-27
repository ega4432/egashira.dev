---
title: Homebrew を dotfiles で管理する際にやったこと
date: "2022-04-12"
tags: ["Homebrew", "macOS", "dotfiles", "bash"]
draft: false
summary: やりだしたらいろいろ苦戦したので未来の自分のためのメモ
---

## はじめに

満を持して dotfiles[^1] を作り始めた。プロダクティビティや自動化といった話が大好きで、やりだしたら時間の許す限り趣向を凝らしたものを作りたくなるので沼だ。

僕が今メインで使用しているマシンは Macbook Pro なので、まずは macOS 用の環境を作っていこうと思った。そして、macOS 用のパッケージマネージャである Homebrew[^2] の管理から始めたのでその際に学んだことや考えたことをまとめる。

## Homebrew の周辺知識

基本的なことは省くが dotfiles を作るにあたり知っておくと良いことを書く。

### Homebrew Bundle

Homebrew Bundle とは、Brewfile というファイルに設定をまとめておくと `brew bundle` コマンドを使って一発で Homebrew の環境構築ができるという仕組み。しかも後述する Homebrew Cask や Mac App Store（以下 MAS）にも対応している。

[Homebrew/homebrew\-bundle: 📦 Bundler for non\-Ruby dependencies from Homebrew, Homebrew Cask and the Mac App Store\.](https://github.com/Homebrew/homebrew-bundle)

つまり dotfiles で Brewfile を管理することで Homebrew で管理しているソフトウェア（及び MAS からインストールしているアプリケーション）の一括インストールが可能になる。

これまで Homebrew を使用していてかつこれから dotfiles を作り始める方は `brew bundle dump` コマンドを使うとカレントディレクトリに Brewfile が生成されるはずだ。

```shell
# 初めて使う場合は適当に何かインストール
$ brew install jq

# Brewfile に出力
$ brew bundle dump

# インストールしたソフトウェアが羅列されていれば OK
$ cat Brewfile
brew "jq"
```

### Homebrew Cask

Homebrew Cask とは GUI を持つアプリケーションを CLI でインストールできる仕組みだ。

[Homebrew Cask extends Homebrew and brings its elegance, simplicity, and speed to the installation and management of GUI macOS applications such as Atom and Google Chrome\. We do this by providing a friendly CLI workflow for the administration of macOS applications distributed as binaries\.](https://github.com/Homebrew/homebrew-cask)

僕は GUI アプリだろうと基本的に Homebrew で管理するようにしている。公式の GitHub にも書いてあるとおり CLI だとスピーディに導入できるので本当におすすめ。

```shell
# cask オプションを付けてインストール
$ brew install --cask alfred

$ brew bundle dump

$ cat Brewfile
brew "jq"
cask "alfred"
```

### Mac App Store

App Store からインストールするアプリも Brewfile で管理する。

```shell
# MAS CLI を導入
$ brew install mas

# インストールしたいアプリケーションを調べる
$ mas search Twitter | hean -n1
  1482454543  Twitter                                                     (9.4.1)

# id を使ってインストール
$ mas install 1482454543

$ brew bundle dump

$ cat Brewfile
brew "jq"
cask "alfred"
mas "Twitter", id: 1482454543
```

ちなみに MAS CLI を使う場合は事前に App Store へログインしておく必要がある。

## インストールスクリプトを書く

これで、Brewfile ができたので、インストールを実行する bash スクリプトを書いていく。

先に全体を貼り付けておく。

```sh title="brew.sh" showLineNumbers
#!/bin/bash -eux

echo "Start setup ..."

if [ $(uname) = Darwin ]; then
    if ! type brew &> /dev/null ; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        echo "Since Homebrew is already installed, skip this phase and proceed."
    fi
    brew bundle install --file=Brewfile
fi
```

簡単に中身について説明すると…

- `uname` で OS が Darwin つまり macOS の場合には処理に進む。
- `type` でコマンドが使用できるか確認し、Homebrew が使えなかったら Homebrew をインストールする。
- 最後に Brewfile を元にソフトウェアを一括でインストールする。

ゆくゆくは macOS 以外でも使用できるようにしたいので、エントリーポイントとなるスクリプトについては OS で分岐させるようにした。

## GitHub Actions で CI を回す

さて、ここまでやってみたはいいがどうやってテストしようと悩んだ末 GitHub Actions の macOS ランナーを使うことにした。

`.github/workflows/` ディレクトリに以下のような YAML ファイルを作った。使用できる環境は [こちら](https://docs.github.com/ja/actions/using-github-hosted-runners/about-github-hosted-runners) を参照して欲しい。

```yaml title=".github/workflows/build.yaml" showLineNumbers
name: "build"

on:
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    name: Build
    runs-on: macos-latest # <--- macOS Big Sur 11

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Execute install script
        run: |
          MAS_APPS="$(cat Brewfile | grep -v brew | grep mas | sed 's/^.*"\(.*\)".*$/\1/' | tr '\n' ' ')"
          export HOMEBREW_BUNDLE_MAS_SKIP="$MAS_APPS"
          export HOMEBREW_BUNDLE_BREW_SKIP="awscli go"
          ./install.sh
```

`install.sh` が実行できるかを確認するだけで良いのだが、GitHub Actions の macOS ランナーでは既に Homebrew や awscli など既にセットアップされている。そのため、`HOMEBREW_BUNDLE_BREW_SKIP` , `HOMEBREW_BUNDLE_MAS_SKIP` を環境変数に設定してインストールをスキップするように細工した。

### 課題

めちゃくちゃ時間がかかる。
10 - 20 分近くかかるので、どうにか改善したい。そもそも実際に Homebrew で全てをインストールするのがよろしくないのでは？という気持ちと厳密にテストしたいという気持ちが戦っている。

## まとめ

Homebrew を dotfiles で管理するために学んだことや考慮したことをまとめてみた。

やってみたいと思ってくれた方は以下のパブリックリポジトリに後悔しているので、是非参考にしていただきたいし、もしいただけるならフィードバックもいただければ嬉しい。

https://github.com/ega4432/dotfiles

今後は `.zshrc` , `.bashrc` , `.vimrc` など本来で言うところのドットで始まるファイルたちの管理を始めていきたい。

[^1]: 初めて聞いたという方は、Google で検索すると上位に出てくる [ようこそ dotfiles の世界へ \- Qiita](https://qiita.com/yutkat/items/c6c7584d9795799ee164) や [GitHub でスター数の多い dotfiles を使ってみた](https://zenn.dev/yutakatay/articles/try-dotfiles-01) を読んでみて欲しい。それで面白そうだと思ったら仲間だ。

[^2]: [macOS（または Linux）用パッケージマネージャー — Homebrew](https://brew.sh/index_ja)

[^3]: [About billing for GitHub Actions \- GitHub Docs](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
