---
title: "Terraform null_resource を使ってコンテナイメージの build から push を行う"
date: "2023-07-15"
tags: ["Terraform"]
draft: false
summary: "こんなことができたのかという発見があったので紹介がてら書いておく"
---

## はじめに

Terraform の `null_resource` という空のリソース定義をする構文があり、それを使ってコンテナイメージの build から push という処理を実行できたので紹介がてら書いておく。

通常 Terraform はインフラ構成を定義できるだけで、その中のサーバの設定などは Ansible などのツールを使う必要がある。しかし、この `null_resource` を使うことで、例えば作成した AWS EC2 の中で任意の処理をしたり、あらゆるスクリプトを実行することができる。

前提として、今回はコンテナレジストリとして AWS ECR を使用している。

## 結論

最初に結論として、コンテナイメージを build, push する `null_resource` の定義を貼っておく。

コマンドに渡す際に外部注入しやすくするために variable をいくつか使用しているが今回は記載を省略している。

```hcl title="main.tf" showLineNumbers
resource "null_resource" "build_and_push" {
  triggers = {
    registry_arn = aws_ecr_repository.repository.arn
  }

  provisioner "local-exec" {
    command = "aws ecr get-login-password --profile ${var.aws_profile} | docker login -u AWS --password-stdin ${aws_ecr_repository.repository.repository_url}"
  }

  provisioner "local-exec" {
    command = "docker build -t ${var.image_name}:${var.image_tag} ."
  }

  provisioner "local-exec" {
    command = "docker tag ${var.image_name}:${var.image_tag} ${aws_ecr_repository.repository.repository_url}"
  }

  provisioner "local-exec" {
    command = "docker push ${aws_ecr_repository.registry.repository_url}"
  }
}

resource "aws_ecr_repository" "repository" {
  # 省略
}
```

## 解説

- triggers
  - トリガーとなる条件を指定する。ここに指定したリソースが変更されると、`null_resource` 内の provisioner の処理が実行される。
- provisioner
  - 実行したいコマンドを定義するブロック。例の通り、複数コマンドを実行したい場合は `provisioner` ブロックを複数定義することもでき、この場合は上から順番に実行される。また今回使用している [`local-exec`](https://developer.hashicorp.com/terraform/language/resources/provisioners/local-exec) は作成したリソース上ではなく、Terraform を実行しているマシン上で実行される。
  - 一方で作成したリソース上でコマンドを実行したい場合は `remote-exec` を使うといいだろう。

## どんな時に使うか

ここまで書いておいてアレだが、Terraform 公式から以下のような記載がある。

> Note: Provisioners should only be used as a last resort. For most common situations there are better alternatives. For more information, see the sections above.

要は、最終手段として利用して欲しいとの意図で、ほとんどが大体の手段があるとのこと。例えば払い出したコンピューティングリソースについては、各クラウドプロバイダから手段が提供されているケースが多い。AWS EC2 だったら、`aws_launch_configuration` で定義できたりする。なので、今回やってみたもののより良い方法があるかもしれない。

## まとめ

いつもは build.sh などのスクリプトにコンテナイメージの build, push 処理を書いて用意していたが、`null_resource` を使用することでコンテナイメージの build, push の処理を tf ファイルに集約することができた。
しかし、その方法についてはベストプラクティスではないかもしれないので、もう少しいい方法がないかは今後も模索したい。

## 参考

https://registry.terraform.io/providers/hashicorp/null/latest/docs/resources/resource

https://developer.hashicorp.com/terraform/language/resources/provisioners/syntax

https://developer.hashicorp.com/terraform/language/resources/provisioners/local-exec
