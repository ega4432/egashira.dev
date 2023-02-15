---
title: GitHub CLI でエイリアスを設定する
date: "2022-07-10"
tags: ["GitHub", "CLI", "Productivity"]
draft: false
summary: GitHub CLI を使った Tips の紹介 第二弾
---

## はじめに

先週に引き続き GitHub CLI の Tips 紹介。以下の記事を見てそんなことができるのかと思ったので試してみた！

[GitHub CLI に不可能はない \- chroju\.dev/blog](https://chroju.dev/blog/gh_github_cli_can_do_anything)

結論から言うと、GitHub CLI のサブコマンド `gh alias` で自由にエイリアスを作成／削除できるので、試してみた。

## `gh alias` サブコマンドの使い方

Usage をチェックすると以下のようにな感じとなる。

```shell
$ gh alias --help
Aliases can be used to make shortcuts for gh commands or to compose multiple commands.

Run "gh help alias set" to learn more.

USAGE
  gh alias <command> [flags]

CORE COMMANDS
  delete:      Delete an alias
  list:        List your aliases
  set:         Create a shortcut for a gh command

INHERITED FLAGS
  --help   Show help for command

LEARN MORE
  Use 'gh <command> <subcommand> --help' for more information about a command.
  Read the manual at https://cli.github.com/manual
```

Usage を見ると一目瞭然ではあるが主に 3 つのことが可能。

- `list`: エイリアスの一覧を確認
- `set` : エイリアスの作成
- `delete` : エイリアスの削除

## エイリアスの設定方法

`gh alias set` で独自でエイリアスを設定できる。

例として、今回は「**自分にアサインされている issue の一覧**」を取得するコマンドにエイリアスを設定する。

何も設定しないと以下のコマンドで実現できる。

```shell
$ gh issue list --assignee @me
```

しかし、これを毎回打つとなると少し長いので、これに対して `gh homework` というエイリアスを設定してみたい。

```shell
$ gh alias set homework 'issue list --assignee @me'
- Adding alias for homework: issue list --assignee @me
✓ Added alias.
```

これでエイリアスの設定が完了した！

テストのため [ega4432/dotfiles](https://github.com/ega4432/dotfiles) リポジトリに都合よく issue があるので、そちらのディレクトリに移動して実行してみる。

```shell
$ gh homework

Showing 2 of 2 issues in ega4432/dotfiles that match your search

#18  macOS settings    less than a minute ago
#8   Terminal          less than a minute ago
```

期待通りの結果を得られてそうなので、無事にエイリアスを設定できている。

まだ先人の知恵を参考にいじっている段階なのでオリジナルものは少ないが、僕が設定しているエイリアスの一覧を載せておく。

```shell
$ gh alias list
aliases:    alias list
co:         pr checkout
create-pr:  pr create --assignee @me --fill --web
gitignore:  api /gitignore/templates/$1 --jq .source
homework:   issue list --assignee @me
mypr:       pr list --state all --assignee @me
open:       repo view --web
s:          api -X GET /search/repositories -f q="$1" --template "{{range .items}}{{.full_name}} -...
unwatch:    api -X DELETE /repos/$1/subscription
watches:    api /users/ega4432/subscriptions --paginate --jq .[].full_name
```

## 設定ファイルの保存場所

エイリアスを設定したものは `~/.config/gh/config.yml` に保存されているようだ。

もし、いろんな端末で設定を共有したい場合などは、クラウドなどにこのファイルを置いておくといいと思う。

ちなみに僕は [dotfiles](https://github.com/ega4432/dotfiles/blob/main/gh.yml) で管理している。

## まとめ

今回は GitHub CLI の `gh alias` サブコマンドについて紹介した。何度も使う長いコマンドに対してはどんどんエイリアスを設定して Productivity を向上させていきたい。

このように GitHub CLI にはまだ知らない便利な機能がありそうなので、今後も発見した場合はブログで紹介したいと思う。

## 参考

https://cli.github.com/manual/

https://chroju.dev/blog/gh_github_cli_can_do_anything
