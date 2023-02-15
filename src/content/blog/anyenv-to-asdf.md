---
title: anyenv から asdf に乗り換える
date: "2022-08-13"
tags: ["anyenv", "asdf", "Homebrew", "macOS", "zsh"]
draft: false
summary: 満を持して乗り換えてみたのでメモ
---

## はじめに

これまでいろんなツールやランタイムのバージョン管理に anyenv を使っていた。

課題としてシェルのロード遅かったり、ネット上や僕の周りで続々と asdf に乗り換える人を見かけたりして気になっていた。

[asdf\-vm/asdf: Extendable version manager with support for Ruby, Node\.js, Elixir, Erlang & more](https://github.com/asdf-vm/asdf)

しかし、乗り換え作業は大掛かりになりそうで重い腰が上がらなかったので、夏休みのタイミングでやってみることにした。

今回の環境は macOS 上で行っている。

## asdf のインストール

インストールの方法は公式のドキュメントに各パッケージマネージャごとの一覧があり、かなり親切にまとめられている。

[Home \| asdf](https://asdf-vm.com/guide/getting-started.html#_3-install-asdf)

中でも僕は「**ZSH & Homebrew**」でやってみることにした。

```shell
$ brew install asdf

$ echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc
```

2 つ目のコマンドで `~/.zshrc` に設定を追記する。

### anyenv のアンインストール

続いて anyenv のアンインストールを行う。

```shell
$ brew uninstall anyenv
```

```shell
$ rm -rf ~/.anyenv
```

`~/.zshrc` に書いていた設定も削除しておく。

```diff:~/.zshrc showLineNumbers
-export PATH="$HOME/.anyenv/bin:$PATH"
-eval "$(anyenv init -)"
```

```shell
$ source ~/.zshrc
```

### 補完設定

既に以下の設定を `~/.zshrc` に記載している場合は、Homebrew でインストールするとそれだけで補完設定ができていた。[^1]

```shell:~/.zshrc showLineNumbers
if type brew &> /dev/null; then
  FPATH=$(brew --prefix)/share/zsh-completions:$FPATH
  autoload -Uz compinit
  compinit
fi
```

違う方法でインストールした場合については、公式ドキュメントを参照して欲しい。

## Node.js プラグインの導入

今回は試しに Node.js のインストールを asdf を使ってやってみる。

### 依存パッケージのインストール

公式ドキュメントによると、事前に asdf-nodejs プラグインの依存パッケージを導入する。

> Each plugin has dependencies so we need to check the plugin repo where they should be listed. For asdf-nodejs they are - ref. [Home \| asdf](https://asdf-vm.com/guide/getting-started.html#plugin-dependencies)

```shell
$ brew install gpg gawk
```

プラグインのインストールを実行する。

```shell
$ asdf plugin add https://github.com/asdf-vm/asdf-nodejs.git
```

今回は最新バージョンをインストールする。

```shell
$ asdf install nodejs latest
Trying to update node-build... ok
Downloading node-v18.7.0-darwin-x64.tar.gz...
-> https://nodejs.org/dist/v18.7.0/node-v18.7.0-darwin-x64.tar.gz
Installing node-v18.7.0-darwin-x64...
Installed node-v18.7.0-darwin-x64 to /Users/<USER>/.asdf/installs/nodejs/18.7.0
```

インストール可能なバージョンを調べたい場合は `asdf list all nodejs <VERSION>` コマンドで確認できる。

```shell
$ asdf list all nodejs 16
16.0.0
16.1.0
...
16.15.1
16.16.0
```

## バージョンの固定

asdf は `.tool-versions` というファイルを元に現在使用するバージョンを判別する。global で使用するバージョンであれば、 `$HOME/.tool-versions` で、local だと `$PWD/.tool-versions` を優先的に参照する。

### global

システム全体で使用するバージョンを固定する場合は `asdf global` コマンドで設定できる。設定したものについては `$HOME/.tool-versions` に保持される。

```shell
$ asdf global nodejs latest

$ cat ~/.tool-versions
nodejs 18.7.0
```

### local

一方でプロジェクトごとバージョンを固定したい場合は `asdf local` コマンドで設定する。設定は `$PWD/.tool-versions` に保持される。この辺りの設定ファイルの扱いは統一感あって非常に分かりやすい！

```shell
$ asdf local nodejs latest

$ cat ./.tool-versions
nodejs 18.7.0
```

### 既存バージョン管理ツールによる固定

[asdf-nodejs](https://github.com/asdf-vm/asdf-nodejs/#nvmrc-and-node-version-support) プラグインは、nodenv や nvm といった Node.js 系のバージョン管理ツール[^2]と同様のバージョン固定方法をサポートしている。

これらのツールの設定ファイルを読み込む設定は `~/.asdfrc` に以下を記載する。

```shell:~/.asdfrc showLineNumbers
legacy_version_file = yes
```

## Terraform 導入

anyenv で管理していた Terraform を導入する。流れは同じなので細かいところは省略する。

```shell
# プラグインを追加
$ asdf plugin add terraform

# プラグインが追加されたことを確認
$ asdf plugin list
nodejs
terraform

# 最新バージョンを確認
$ asdf latest terraform
1.2.7

# 最新をインストール
$ asdf install terraform latest
Downloading terraform version 1.2.7 from https://releases.hashicorp.com/terraform/1.2.7/terraform_1.2.7_darwin_amd64.zip
...
terraform_1.2.7_darwin_amd64.zip: OK
Cleaning terraform previous binaries
Creating terraform bin directory
Extracting terraform archive

$ asdf list
nodejs
  16.13.0
  16.16.0
  18.7.0
terraform
  1.2.7

$ terraform --version
Terraform v1.2.7
on darwin_amd64
```

## まとめ

今回は各ランタイムのバージョン管理ツールを anyenv から asdf へ移行した！

結構前から気になっていたが腰が重くてこんなタイミングになってしまった。既にネット上に多くの記事が公開されているので全く困ることはなかった。

また、この類の設定ファイルは dotfiles で管理している方も多いので他人の dotfiles を覗いてみてどんなランタイムや CLI を asdf で管理しているかも参考になるのではないだろうか。参考になるものが見つかれば少しずつ asdf に移行できたらと思う。

## 参考

https://asdf-vm.com/

https://github.com/asdf-vm/asdf-nodejs/

https://docs.brew.sh/Shell-Completion#configuring-completions-in-zsh

[^1]: [Homebrew Shell Completion — Homebrew Documentation](https://docs.brew.sh/Shell-Completion#configuring-completions-in-zsh)
[^2]: 以前は Node.js のバージョン管理に anyenv 経由で nodenv というツールを使用していた。nodenv のローカルのバージョン固定には .node-version というファイルを使用する。
