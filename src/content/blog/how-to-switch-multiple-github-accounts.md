---
title: 複数の Git アカウントを使い分ける設定
date: "2022-08-24"
tags: ["Git", "GitHub", "Productivity"]
draft: false
summary: 普段から使い分ける必要がある人はこれやっておくと便利だよというものをまとめた
---

## はじめに

ふと会社の人が質問しているのを見かけたので、割と需要はあるのかなと思い、僕がローカルでやってる設定をまとめてみた。

## 複数 Git アカウントを使うケース

僕が所属する会社では [GitHub Enterprise Server](https://github.co.jp/enterprise.html) を導入しており、Enterprise のアカウントと個人のプライベートアカウントとの 2 つの GitHub アカウントを使い分けることになる。

他にも GitLab やクラウド上の Git サーバである AWS CodeCommit なんかを含めると複数の Git アカウントを使い分けるというケースは割とあると思う。

本記事はそういった場合に、どういう設定をしておけばストレスなく使い分けができるかといったポイントをまとめておく。

## SSH の設定

基本的には SSH で接続するため、事前にそれぞれのアカウントで使用する公開鍵・秘密鍵を生成しておく。この記事では、鍵の作成はできている前提で省略する。[^1]

SSH の設定は、`~/.ssh/config` に定義するので、以下に Enterprise 用と個人のプライベート用の設定を示す。
前者が Enterprise アカウント用の設定で、後者がプライベートアカウント用の設定になる。

```config:~/.ssh/config showLineNumbers
Host github.company.com
  HostName github.company.com
  IdentityFile ~/.ssh/id_github_rsa
  User git

Host github.com
  HostName github.com
  IdentityFile ~/.ssh/id_github_private_rsa
  User git
```

`HostName github.company.com` の部分についてはご自身の会社の GitHub Enterprise Server のドメインを記載すれば良い。

## .gitconfig のユーザの設定

Git では commit する際にユーザの情報（ユーザ名、メールアドレス）が必要になる。

ユーザの情報については、グローバルの設定として基本的に `~/.gitconfig` に設定していると思う。

```config:~/.gitconfig showLineNumbers
[user]
    name = "taro yamada"
    email = "taro.yamada@comapny.com"
```

しかし、上記のように会社のアカウントのユーザ情報のみを設定している場合、リポジトリを作成もしくはクローンした際に、都度手動でユーザ設定をする必要がある。

```shell
$ git config --local user.name = "private"
$ git config --local user.email = "private@example.com"
```

これを忘れると、プライベートのアカウントで commit したいのに誤って会社アカウントで commit してしまうというミスが起こることもある。

`~/.gitconfig` で `includeIf` を使うと、この問題を解決を解決できる。

```config:~/.gitconfig showLineNumbers
[user]
    name = "taro yamada"
    email = "taro.yamada@comapny.com"

[includeIf "gitdir:~/private/**"]
    path = ~/.gitconfig.private
```

```config:~/.gitconfig.private showLineNumbers
[user]
    name = "private"
    email = "private@example.com"
```

このようにすることで `~/private` 配下の Git リポジトリはプライベートのアカウントで、それ以外は会社のアカウントでと切り替えて commit できる。

ただ、これも完全なソリューションではなく、配置するディレクトリを間違うと意味がないのでご自身でルールを決めて運用する必要がある。

## まとめ

複数の Git アカウントをストレスフリーに使い分ける方法について紹介した。

僕の `~/.gitconfig` は [dotfiles](https://github.com/ega4432/dotfiles/blob/main/gitconfig) に公開しているので、良かったら是非参考にしてほしい！

## 参考

https://git-scm.com/book/ja/v2/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-%E6%9C%80%E5%88%9D%E3%81%AEGit%E3%81%AE%E6%A7%8B%E6%88%90

https://kakakakakku.hatenablog.com/entry/2019/11/06/114926

https://qiita.com/shizuma/items/2b2f873a0034839e47ce

[^1]: 公開鍵・秘密鍵の作成については、こちらの記事が大変参考になると思う。[GitHub で ssh 接続する手順~公開鍵・秘密鍵の生成から~ \- Qiita](https://qiita.com/shizuma/items/2b2f873a0034839e47ce)
