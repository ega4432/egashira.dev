---
title: "Terraform 管理下の Code Engine でプライベートレジストリのイメージを使う"
date: "2023-06-19"
tags: ["IBM Cloud", "Code Engine", "Container Registry", "Container"]
draft: false
summary: "何も考えずにプライベートレジストリのコンテナイメージを指定したらエラーになってハマったので書いておく"
---

## はじめに

[Code Engine](https://www.ibm.com/jp-ja/cloud/code-engine) でアプリケーションを動かす際に、何も考えずにプライベートレジストリのコンテナイメージを指定してデプロイしたところ以下のようなエラーになって、ちょっとつまずいたので今後の自分のためにもやったことを書いておく。

ちなみにプライベートレジストリとしては、今回 [Container Registry](https://www.ibm.com/jp-ja/cloud/container-registry) を使用している。

```bash
$ terraform apply -var-file=terraform.tfvars -auto-approve

...
（省略）
...

│ Error: Error waiting for resource IbmCodeEngineApp (12345678-8910-xxxx-xxxx-1x1x1x1x1x1x1x/sample-app) to be created: The instance getAppOptions failed: %!s(<nil>)
│ {
│     "StatusCode": 200,
│     "Headers": {
│         "Cache-Control": [
│             "no-cache, no-store"
│         ],
│         "Content-Length": [
│             "1258"
│         ],
│         "Content-Type": [
│             "application/json; charset=UTF-8"
│         ],
│         "Date": [
│             "Mon, 12 Jun 2023 05:54:56 GMT"
│         ],
│         "Etag": [
│             "12345678910"
│         ],
│         "Strict-Transport-Security": [
│             "max-age=31536000; includeSubDomains; preload"
│         ],
│         "X-Content-Type-Options": [
│             "nosniff"
│         ]
│     },
│     "Result": {
│         "created_at": "2023-06-12T05:53:56Z",

(省略)

│
│   with ibm_code_engine_app.main_app,
│   on main.tf line 30, in resource "ibm_code_engine_app" "main_app":
│   30: resource "ibm_code_engine_app" "main_app" {
```

HCL ファイルは以下のような感じだった。

```HCL:main.tf showLineNumbers
resource "ibm_code_engine_secret" "app_secret" {
  project_id = var.project_id
  name       = "${var.project_name}-secret"
  format     = "generic"

  data = {
    BASIC_AUTH_NAME     = var.basic_auth_name
    BASIC_AUTH_PASSWORD = var.basic_auth_password
    # omit other variables
  }
}

resource "ibm_code_engine_app" "main_app" {
  project_id              = var.project_id
  name                    = "${var.project_name}-app"
  image_reference         = var.image
  image_port              = 3000
  managed_domain_mappings = "local_public"
  scale_min_instances     = 1

  run_env_variables {
    reference = "${var.project_name}-secret"
    type      = "secret_full_reference"
  }
}
```

もちろん `terraform plan` も問題なく、上記の `terraform apply` のログではリソースの作成には成功していそうで、どこでエラーになっているのかぱっと見では分からなかった。

## 原因

IBM Cloud の Web コンソールを確認すると、すぐに判明した。
Code Engine のアプリケーションの画面を見ると、「リビジョンの準備ができていません」というメッセージが出ていた。

![IBM Cloud Web console 1](https://user-images.githubusercontent.com/38056766/246586790-7dbe9276-0b9e-4c7e-bf35-e47ab5eb1909.png)

また「構成」タブを見てみると一目で原因に気づけたが、見ての通りプライベートレジストリからのイメージのプルに失敗していた。

![IBM Cloud Web console 1](https://user-images.githubusercontent.com/38056766/246586799-48e51372-a132-45a9-97a2-2b9e23a27c31.png)

プライベートレジストリからのイメージを取得するにはレジストリー・アクセス・シークレットが必要らしい。当然必要になるものを忘れていた。

## 対処方法

公式のドキュメントを参考にした。

https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/code_engine_secret

上記リンク先によると、`ibm_code_engine_secret` リソースを format `registry` 、data を `username`, `password`, `server` で作成する。

https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/code_engine_app

> image_secret - (Optional, String) Optional name of the image registry access secret. The image registry access secret is used to authenticate with a private registry when you download the container image. If the image reference points to a registry that requires authentication, the app will be created but cannot reach the ready status, until this property is provided, too.

また `ibm_code_engine_app` リソースについては、作成した `ibm_code_engine_secret` のリソース名を `image_secret` プロパティに指定するという方法らしい。

上記を踏まえると HCL ファイルは最終的に以下のようになった。

```diff:main.tf showLineNumbers
resource "ibm_code_engine_secret" "app_secret" {
  project_id = var.project_id
  name       = "${var.project_name}-secret"
  format     = "generic"

  data = {
    BASIC_AUTH_NAME     = var.basic_auth_name
    BASIC_AUTH_PASSWORD = var.basic_auth_password
    # omit other variables
  }
}

+ resource "ibm_code_engine_secret" "registry_secret" {
+   project_id = var.project_id
+   name       = "${var.project_name}-registry-secret"
+   format     = "registry"
+
+   data = {
+     username = var.registry_username
+     password = var.registry_secret
+     server   = var.registry_server
+   }
+ }

resource "ibm_code_engine_app" "main_app" {
  project_id              = var.project_id
  name                    = "${var.project_name}-app"
  image_reference         = var.image
+ image_secret            = "${var.project_name}-registry-secret"
  image_port              = 3000
  managed_domain_mappings = "local_public"
  scale_min_instances     = 1

  run_env_variables {
    reference = "${var.project_name}-secret"
    type      = "secret_full_reference"
  }
}
```

```diff:variables.tf
variable "project_name" {}
# 省略

+ variable "registry_username" {
+   type        = string
+   default     = "iamapikey"
+   description = "The username of registry secret"
+ }
+
+ variable "registry_secret" {
+   type        = string
+   description = "The secret value of registry secret"
+ }
+
+ variable "registry_server" {
+   type        = string
+   default     = "jp.icr.io"
+   description = "The server of registry secret"
+}
```

`registry_secret` は、IBM Cloud の Web コンソールなどから API key を発行し、それを使えば良い。今回は、Container Registry 上にあるイメージを指定するため、それに合わせてデフォルト値を指定している。

## まとめ

プライベートレジストリにあるコンテナイメージを指定してデプロイする際は、レジストリ・アクセス・シークレットを指定する必要があることが分かり、Terraform の公式ドキュメントを確認するとすぐに解決できた！

`terraform plan` で検知できず、`terraform apply` でもそれっぽい原因となるエラーメッセージが表示されずでハマりかけたので、もし同じ現象に出くわした人の参考になればと思う。
