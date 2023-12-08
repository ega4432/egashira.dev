---
title: "Go で環境変数を扱うのは caarlos0/env パッケージが便利"
date: "2023-12-27"
tags: ["Go"]
draft: true
summary: "環境変数から値を取得する際にいつも使うパッケージの使い方について調べてみた"
---

## はじめに

タイトルの通り、こちらのパッケージについて（多くの人がご存知ではあると思うが）勉強がてら調べてみたので使い方などをまとめる。

https://github.com/caarlos0/env

## 基本的な使い方

まずはインストール。

```sh
go get github.com/caarlos0/env/v10
```

使い方としては、環境変数用の構造体を用意して、パースしてあげればいい感じに読み込んでくれる。

```go:config.go showLineNumbers
package main

import (
    "github.com/caarlos0/env/v10"
)

type Config struct {
    DbHost     string `env:"DB_HOST"`
	DbPort     int    `env:"DB_PORT"`
}

func main() {
    cfg := &Config{}
    if err := env.Parse(cfg); err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%s:%d\n", cfg.DbHost, cfg.DbPort)
}
```

```sh
# 環境変数に値を設定しておく
$ export DB_HOST=localhost
$ export DB_PORT=3306

$ go run main.go
localhost:3306
```

## デフォルト値

`envDefault` タグを使うことで、環境変数が設定されていない場合のデフォルト値を設定できる。

```go:config.go showLineNumbers
type Config struct {
	DbHost string `env:"DB_HOST" envDefault:"example.com"`  // <---  here
	DbPort int    `env:"DB_PORT"`
}

func main() {
	cfg := Config{}
	if err := env.Parse(&cfg); err != nil {
		log.Fatal(err)
	}
    fmt.Printf("%s:%d\n", cfg.DbHost, cfg.DbPort)
}
```

```sh
$ go run main.go
example.com:3306
```

`envDefault` で事足りるのであまり使わないかもしれないが、コード上でデフォルト値を指定することもできる。[^1]

## 必須項目の指定

`required` オプションを使うことで環境変数に設定されていることを確認できる。

```go:config.go showLineNumbers
type Config struct {
	DbHost string `env:"DB_HOST,required"` // <--- here
	DbPort int    `env:"DB_PORT"`
}

func main() {
	cfg := Config{}
	if err := env.Parse(&cfg); err != nil {
		log.Fatal(err)
	}
    fmt.Println("env vars all ok")
}
```

```sh
# 環境変数を削除
$ unset $DB_HOST

$ go run ./main.go
2023/12/27 xx:xx:xx env: required environment variable "DB_HOST" is not set
exit status 1
```

似たようなオプションで `notEmpty` というのがある。`required` は環境変数に設定されているかのみをチェックするが、`notEmpty` オプションは空文字かどうかまでチェックしてくれるので、より厳密に確認したい場合はこちらを使うと良いと思う。[^2]

また、`RequiredIfNotDef` というオプションを使うことで、`envDefault` でデフォルト値が設定されていない項目を全て必須項目として扱うことができる。[^3]

## ネストした構造体

ネストした構造体を使うこともできる。ネストした構造体の方には `envPrefix` タグを使ってプレフィックスの設定をしておく。

```go:config.go showLineNumbers
type AuthConfig struct {
	Username string `env:"USERNAME"`
	Password string `env:"PASSWORD"`
}

type Config struct {
	// ...
	Auth     AuthConfig `envPrefix:"AUTH_"` // <--- here
}

func main() {
	// ...
	fmt.Printf("%#v\n", cfg.Auth)
}
```

```sh
$ export AUTH_USERNAME=ega4432
$ export AUTH_PASSWORD=password

$ go run ./main.go
{Username:ega4432 Password:password}
```

## slice

サポートされている型についてはいろいろあって詳細は [ここ](https://github.com/caarlos0/env?tab=readme-ov-file#supported-types-and-defaults) を見ると良さそう。あまりこういう使い方はしないかもしれないが、slice を試したので一例として書いておく。

```go:config.go showLineNumbers
type Config struct {
    // ...
    StrSlice []string `env:"STR_SLICE" envDefault:"a,b,c"`
}

func main() {
    // ...
    fmt.Printf("%T\n", cfg.StrSlice)
	fmt.Printf("%v\n", cfg.StrSlice)
}
```

```sh
$ go run ./main.go
[a b c]
[]string
```

## まとめ

Go 言語で環境変数を扱う際に便利だった caarlos0/env パッケージを紹介した。
アプリケーションを作る際には、データを外部ストア領域に永続化したり、API でサードパーティサービスと連携したりする場面はよくあるので、Git に commit したくない値はこのパッケージを使って環境変数からサクッと取得できるので便利だと思う。

同じようなケースに遭遇した人の参考になったら嬉しい。

## 参考

https://github.com/caarlos0/env

https://pkg.go.dev/github.com/caarlos0/env/v10

[^1]: Defaults from code - ref. https://github.com/caarlos0/env?tab=readme-ov-file#defaults-from-code
[^2]: Not Empty fields - ref. https://github.com/caarlos0/env?tab=readme-ov-file#not-empty-fields
[^3]: Making all fields to required - ref. https://github.com/caarlos0/env?tab=readme-ov-file#making-all-fields-to-required
