---
summary: "GitHub provider を使ってモジュールを作ってみた"
tags:
  - "Terraform"
  - "GitHub"
date: "2023-09-16"
draft: false
title: "Terraform の GitHub provider を触ってみた"
---

## はじめに

Terraform に GitHub provider があるのは以前から知ってはいたが、ようやく触ることができたので軽く紹介がてら記事に書いておく。

https://registry.terraform.io/providers/integrations/github/latest/docs

## GitHub provider の使い方

AWS などの他クラウド provider を Terraform で実装したことのある方には特に解説は必要ないだろう。

以下のように .tf ファイルを用意して、使用する terraform や provider のバージョン情報を記載する。

Terraform のバージョンは v0.13 以上である必要がある。

```hcl title="providers.tf" showLineNumbers
terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }
}

provider "github" {}
```

GitHub provider は GitHub API を使ってリソースの作成や変更を行う。そのため GitHub API を使用するために認証が必要になる。

詳細は以下に記載があるのでこちらを見てもらいたいが、ざっくりいうと GitHub CLI, OAuth/Personal Access Token(以下 PAT), GitHub App の 3 パターンがある。

https://registry.terraform.io/providers/integrations/github/latest/docs#authentication

一例として PAT を使う場合だと、以下のようにしておけば

```hcl title="providers.tf" showLineNumbers
provider "github" {
  token = var.github_pat
}
```

以下のように使用できる。

```sh
$ export TF_VAR_github_pat=xxxx
$ terraform plan
# --- OR ---

$ terraform plan -var github_pat=xxxx
```

## 作ったもの

仕事でちょうど GitHub Organization 管理をすることがあったので、module を作ってみた。

https://github.com/ega4432/terraform-github-org-setup

### 作った経緯

ユースケースとして、会社やイベントなどで Organization にそれぞれメンバーを追加し、それぞれが自身のリポジトリを作って作業をする場合を想定している（正直そういうユースケースなんて限られているのは重々承知しているが弊社では割と 1 年に数回あるということでご承知いただければ :pray:）。

この場合、主催者側が追加するメンバーをポチポチと Organization に追加する手間と、メンバーそれぞれのリポジトリを用意する手間がかかる（各自にリポジトリを作ってもらう運用でも命名規則など周知したりする必要がある）。

また、そのイベントなどが終わった暁には、Collaborator から追い出すという手間がかかる。

10 人程度であれば上記手順を手作業で行えるが 3 桁人まで行くとかなり時間がかかってしまうと同時に、公開設定など間違えたりして情報漏洩にも繋がりかねない。

上記の理由より Terraform で管理すれば楽なのではないかと思って module を作ってみた！

### module が提供する機能

機能としては以下を備えている。

- GitHub Organization の設定
- GitHub Organization へのユーザの招待
  - owner 権限
  - member 権限
- member 権限ユーザの repository の作成
- 上記 repository への Collaborator 追加

今回突貫で必要最低限のものを実装したので汎用性も高い訳ではない。もし、こういう場合に対応してほしいなどあれば [issue](https://github.com/ega4432/terraform-github-org-setup/issues) に起票してもらえればと思う :bow:

## まとめ

以上、Terraform の GitHub provider を触ってみて、身の回りにある課題を解決するためちょっとした module を作ってみたという紹介だった。また何かアップデートがあれば記事に書きたいと思う。

## 参考

https://registry.terraform.io/providers/integrations/github/latest/docs
