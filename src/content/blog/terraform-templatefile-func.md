---
title: "Terraform の templatefile 関数でテンプレートファイルを扱ってみる"
date: "2023-08-19"
tags: ["Terraform"]
draft: false
summary: "Terraform の Tips 紹介"
---

## はじめに

Terraform の組み込み関数に `templatefile` という関数が用意されており、それを使うと tf や JSON などのファイルをテンプレートとしてレンダリングできる。

```hcl
templatefile(path, vars)
```

上記のような構文で、第一引数の path でテンプレートとして使用するファイルのパスを指定し、第二引数の vars でテンプレートファイルに渡す引数をオブジェクト形式で指定する。

## やり方

今回の記事では、AWS ECS の task definition のリソース定義である `aws_ecs_task_definition` で使用した例をあげる。

該当箇所以外は省略して記載しているのでご注意いただければと思う。

まずは、main.tf の `container_definitions` のところで `templatefile` 関数を使っている。

`./templates/api.json.tpl` をテンプレートファイルのパスとして指定し、`vars.secrets` を渡している。

`aws_ecs_task_definition` は結構肥大化しやすいので、`container_definitions` の箇所を別ファイル化しておくと可読性を維持できていいと思う。

```hcl title="modules/ecs/main.tf" showLineNumbers
resource "aws_ecs_task_definition" "main" {
  ...
  (省略)
  ...

  container_definitions = templatefile("${path.module}/templates/api.json.tpl", var.container_def_vars)
}

variable "container_def_vars" {
  type    = map(string)
  default = {}
}
```

次にテンプレートファイルの JSON だが、以下のようなイメージで作ってあげればいいと思う。

例によってあまり関係ない箇所は省略しているが、`${var}` のような記述をしているところに注目してほしい。このように記述することで外部から引数を渡すことができる。

以下のファイルでは `${node_env}` と `${port}` を外部から注入している。

```json title="modules/ecs/templates/api.json.tpl" showLineNumbers
[
  {
    "name": "sample-api",
    "image": "xxxxxxxxxxxxx.dkr.ecr.ap-northeast-1.amazonaws.com/sample-api",
    "cpu": 0,
    "portMappings": [
      {
        "name": "sample-api-tcp",
        "containerPort": 4000,
        "hostPort": 4000,
        "protocol": "tcp"
      }
    ],
    "essential": true,
    "environment": [],
    "secrets": [
      {
        "name" : "NODE_ENV",
        "valueFrom" : "${node_env}" // [!code ++]
      },
      {
        "name" : "PORT",
        "valueFrom" : "${port}"  // [!code ++]
      }
    ],
    "mountPoints": [],
    "volumesFrom": [],
    "logConfiguration": {  ... (省略) ...  }
  }
]
```

## まとめ

以上、`templatefile` 関数を使ってテンプレートファイルに変数を埋め込む方法を紹介した。こんな書き方をできるのを知らなかったので、誰かの参考になればと思う。

## 参考

https://developer.hashicorp.com/terraform/language/functions/templatefile
