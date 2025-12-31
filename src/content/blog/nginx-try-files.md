---
title: "nginx の try_files ディレクティブの挙動を見てみた"
date: "2022-09-17"
tags: ["nginx"]
draft: false
summary: 設定する機会があってざっと調べたのでまとめ
---

## はじめに

nginx の設定ファイルを書いていてふと try_files ってどんな挙動するんだっけと気になった。この記事では調べた内容、挙動をまとめておく。

## 結論

### シンタックス

[ドキュメント](http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files) を見ると以下のようなシンタックスになっている。

```
Syntax:	try_files file ... uri;
try_files file ... =code;
Default:	—
Context:	server, location
```

### どういう挙動か

以下に設定ファイルの一例を置いておく。

```nginx showLineNumbers
server {
    ...
    location / {
        ...
        try_files $uri $uri/ $uri/index.html $uri.html =404; # [!code ++]
    }
}
```

- try_files ディレクティブに設定してある値を左から順に評価し、サーバ上に静的コンテンツがあれば返す。
- `$uri/` のようにディレクトリも指定可能。
- 末尾に最終的に見つからなかった場合のステータスコードを定義でき、`=code` 形式で指定する。
- （上記には記載はないが）`@proxy` のように名前付きロケーションにプロキシさせることも可能。

## 検証

### Docker コンテナを使う

検証として公式の [nginx:1.23.1](https://github.com/nginxinc/docker-nginx/blob/f3d86e99ba2db5d9918ede7b094fcad7b9128cd8/mainline/debian/Dockerfile) コンテナイメージを使用する。イメージは、[Docker Hub](https://hub.docker.com/_/nginx) から pull できる。

ディレクトリの構成は以下のようにいくつかの静的コンテンツを用意しておく。ここで使用する HTML ファイルの中身はそれぞれの区別ができれば何でも良い）

```sh
$ tree .
.
├── contents
│   ├── hoge
│   │   └── index.html
│   └── index.html
└── nginx.conf

2 directories, 3 files
```

nginx の設定ファイルは以下。

```nginx title="nginx.conf" showLineNumbers
server {
    listen       80;
    root         /usr/share/nginx/html;

    include /etc/nginx/default.d/*.conf;

    location / {
        index     index.html index.htm index.php;
        try_files $uri $uri/ $uri/index.html $uri.html =404;
    }
}
```

nginx コンテナをデバッグモードで起動する。

起動時に `-v(--volume)` オプションを用いて設定ファイルとコンテンツをマウントする。また、`-p(--publish)` オプションを用いてコンテナ上の 80 番ポートとホスト上の 8080 番ポートをバインドする。

```sh
$ docker run -itd --rm --name nginx \
    -v ${PWD}/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
    -v ${PWD}/contents/:/usr/share/nginx/html:ro  \
    -p 8080:80 \
    nginx:1.23.1 nginx-debug -g 'daemon off;'
```

### cURL でアクセス

`/` ルートにアクセスすると、`./contents/index.html` の内容が返る。

```sh
$ curl http://localhost:8080
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to nginx!</title>
  </head>
  <body>
    <h1>Welcome to nginx!</h1>
  </body>
</html>
```

`/hoge` にアクセスすると、`./contents/hoge/index.html` の内容が返る。

```sh
$ curl http://localhost:8080/hoge
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to hoge page!</title>
  </head>
  <body>
    <h1>Welcome to hoge page!</h1>
  </body>
</html>
```

`/hoge/` にアクセスすると、`./contents/hoge/index.html` の内容が返る。

```sh
$ curl http://localhost:8080/hoge/
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to hoge page!</title>
  </head>
  <body>
    <h1>Welcome to hoge page!</h1>
  </body>
</html>
```

`/hoge/index.html` にアクセスすると、`./contents/hoge/index.html` の内容が返る。

```sh
$ curl http://localhost:8080/hoge/index.html
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to hoge page!</title>
  </head>
  <body>
    <h1>Welcome to hoge page!</h1>
  </body>
</html>
```

存在しないパス `/aaaaaaaaaaaaaa` にアクセスすると、ステータスコード 404 とデフォルト 404 ページの内容が返る。

```sh
$ curl http://localhost:8080/aaaaaaaaaaaaaa
<html>
  <head><title>404 Not Found</title></head>
  <body>
    <center><h1>404 Not Found</h1></center>
    <hr><center>nginx/1.23.1</center>
  </body>
</html>
```

## まとめ

結論としては `try_files` は左から順に評価されるので、書く順番が重要。必要に応じて末尾にステータスコードを定義したり、名前付きロケーションを使って動的なパスへのプロキシ設定などをしてあげると良さそう。ちゃんと理解できたので使いこなしていきたい。

## 参考

http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files

https://qiita.com/kaikusakari/items/cc5955a57b74d5937fd8

https://amzn.to/48tf5lX

https://amzn.to/48jfFmg
