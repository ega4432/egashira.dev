---
title: IBM Cloud Code Engine に Go アプリをデプロイする
date: "2022-07-29"
tags: ["IBM Cloud", "Code Engine", "Container", "Go"]
draft: false
summary: 初めて触ってみたので軽くまとめ
---

## はじめに

IBM Cloud に Code Engine というサーバレスなサービスがあって以前から気になったので触ってみた。

## 事前準備

以下を事前に行っておく必要がある。今回は長くなってしまうため割愛。

- IBM Cloud 上の準備
  - アカウントを持っていない場合は事前に作成する
  - Code Engine のプロジェクトを作成
- サンプルアプリ
  - 何でもいいが確認のためのシンプルなアプリケーションがあると良い

## 今回使用するサンプルアプリ

今回は、非常にシンプルな Go のアプリを使用した。

先に全体感を示すとこんな感じで、メインは、ソースコードのロジック部分である main.go とアプリケーションをコンテナ化するための Dockerfile を用意した。

```sh
$ tree .
.
├── Dockerfile
├── go.mod
├── go.sum
└── main.go
```

### main.go

main.go には、サーバを立ち上げる処理とルーティングを少々定義している。

```go title="main.go" showLineNumbers
package main

import (
    "fmt"
    "log"
    "net/http"

    "github.com/gorilla/mux"
)

func rootHandler(w http.ResponseWriter, r *http.Request) {
	    fmt.Fprint(w, "hello world")
}

func hogeHandler(w http.ResponseWriter, r *http.Request) {
	    fmt.Fprint(w, "hello fuga")
}

func fooHandler(w http.ResponseWriter, r *http.Request) {
	    fmt.Fprint(w, "hello bar")
}

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/", rootHandler)
    r.HandleFunc("/hoge", hogeHandler)
    r.HandleFunc("/foo", fooHandler)
    http.Handle("/", r)
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

`/` にアクセスすれば `hello world` が、`/hoge` にアクセスすれば `hello fuga` が、`/foo` にアクセスすれば `hello bar` が表示されるといったかたちになっている。

### Dockerfile

マルチステージビルドを使って、コンパイルされたバイナリだけを後続のステージへコピーしている。

個人的な興味として distroless[^1] をベースイメージとして使ってみた！

```dockerfile title="Dockerfile" showLineNumbers
# === Build phase ===
FROM golang:1.18.3 AS builder

ENV GOPATH /go
ENV CGO_ENABLED 0
ENV GO111MODULE on
ENV GOOS linux
ENV GOARCH amd64

WORKDIR /go/src/app

COPY go.* ./

RUN go mod download

COPY *.go ./

RUN go build -o /bin/main .

# === Runtime phase ===
FROM gcr.io/distroless/static-debian11

COPY --from=builder /bin/main /bin/main
EXPOSE 8080

CMD [ "/bin/main" ]
```

上記を元にコンテナイメージをビルドし、レジストリにアップロードした。

今回アップしたものは、Docker Hub に公開しているので、とりあえず動かしてみたいという方は是非使ってみてほしい。

https://hub.docker.com/repository/docker/ega4432/sample-api

```sh
# Usage:
$ docker pull ega4432/sample-api
```

前置きが長くなってしまったが、ここまでで事前準備が完了となる。

## アプリケーションの作成

それでは、実際に IBM Cloud の Web 画面から Code Engine のページに行き、実際にアプリケーションをデプロイしていく。

アプリケーションの作成画面では以下を入力する。

- 名前: `任意の名前`
- イメージ参照: `docker.io/ega4432/sample-api:latest`
- listen ポート: `8080`
- エンドポイント: `パブリックにチェックを入れる`

あとはランタイム設定、環境変数、コマンドのオーバーライドなどは必要に応じて設定する。

簡単に説明すると、インスタンスの CPU やメモリと言ったリソース設定できたり、インスタンスの最大値最小値を設定できたりが可能となっている。

今回はお試しということもあり、インスタンス数は最小 `1` の最大 `2`、CPU およびメモリーは 1 個の `vCPU/2GB` とした。

作成をクリックすると、下記のようにデプロイが開始される。

![Deploying ...](https://i.imgur.com/txZT0B5.webp)

数秒待つと、デプロイが終了し「準備完了」に切り替わる。そのまま概要タブに移動すると確かに 1 つのインスタンスが立ち上がっているのが分かる。

![Overview](https://i.imgur.com/xgfeV2A.webp)

エンドポイントタブを見ると、パブリックにアクセスできる URL が表示される。

![Endpoint](https://i.imgur.com/zZKSkI5.webp)

実際にアクセスするとちゃんと期待通りの結果が得られた！

```sh
$ curl -s https://go-ce-sample.qv6t88p3xf0.jp-tok.codeengine.appdomain.cloud
hello world

$ curl -s https://go-ce-sample.qv6t88p3xf0.jp-tok.codeengine.appdomain.cloud/hoge
hello fuga

$ curl -s https://go-ce-sample.qv6t88p3xf0.jp-tok.codeengine.appdomain.cloud/foo
hello bar
```

## まとめ

IBM Cloud のサーバレスなサービス「Code Engine」を使ってみたのでその紹介として書いてみた！

使ってみて、コンテナ化されたアプリケーションをデプロイしたい場合、割と適した選択肢なんじゃないかなと思った。
料金は使用に応じた分の所謂従量課金だし、[公式](https://www.ibm.com/cloud/code-engine/pricing) を見た感じだとかなり使いまくらない限りは無料枠で収まるだろう。またパブリックにアクセスできる URL を他のサービスを使うことなくサクッと発行できるのも良いポイントだった。

気になる方は是非触ってみてほしい！

## 参考

https://www.ibm.com/cloud/code-engine

[^1]: Google が提供している Debian ベースの軽量コンテナイメージ GitHub: https://github.com/GoogleContainerTools/distroless
