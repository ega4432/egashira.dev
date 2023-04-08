---
title: nginx コンテナに Basic 認証をかける
date: "2022-10-08"
tags: ["nginx", "Docker", "Container"]
draft: false
summary: よくやるのでまとめておく
---

## はじめに

とりあえず作ったプロトタイプをチームのメンバーに共有したい場合など、一旦 Basic 認証をかけて公開するということがある。その際は nginx コンテナで動かすことが多いのその方法についてまとめておく。

## 結論

最低限必要なファイルは以下の 2 つ。

```sh
.
├── Dockerfile
└── default.conf

0 directories, 2 files
```

コピペで使えるようにとりあえずファイルの内容全体を貼り付ける。

```diff:default.conf showLineNumbers
server {
    listen       8080;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;

+       # basic auth
+       auth_basic            "Restriceted";
+       auth_basic_user_file  /etc/nginx/.htpasswd;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

ルートに対して Basic 認証の設定を入れている。

- `auth_basic` : 認証領域に対して任意の名前を設定。
  - `auth_basic: off;` にすると認証を無効化できる。
- `auth_basic_user_file` : Basic 認証のユーザー名とパスワードを保持するファイル。
  - ファイルのフォーマットについては以下である必要がある。
  - パスワードには、`openssl passwd` コマンドで生成されたものや MD5 アルゴリズムでハッシュ化されたものなどが使用できる。

```
# comment
name1:password1
name2:password2:comment
name3:password3
```

どちらも `http`, `server`, `location`, `limit_except` のディレクティブで指定できる。親のパスで設定している場合、ネストされたパスでも設定が継承される。ネストされたパスで無効化したい場合は、前述の `auth_basic: off;` で無効化も可能。

```diff:Dockerfile showLineNumbers
FROM nginx:1.23.1 AS build

+ ARG BASIC_AUTH_USER
+ ARG BASIC_AUTH_PASSWORD

# Basic 認証ファイルを生成
+ RUN crypt_pass=`openssl passwd -crypt ${BASIC_AUTH_PASSWORD}` && \
+     echo "${BASIC_AUTH_USER}:${crypt_pass}" > .htpasswd

FROM nginx:1.23.1

# nginx の設定ファイル
COPY default.conf /etc/nginx/conf.d/

+ COPY --from=build .htpasswd /etc/nginx/.htpasswd

# nginx の必要な設定
# nginx の必要な設定
RUN touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx && \
    chmod -R g+w /var/cache/nginx

# ログ設定
RUN mkdir -p /var/log/nginx && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# nginx ユーザでコンテナを起動
USER nginx
EXPOSE 8080

CMD [ "nginx", "-g", "daemon off;" ]
```

- `ARG` 命令
  - 認証ファイルの生成に必要なユーザ名、パスワードを Dockerfile 内で一時的に使用するため、`ENV` ではなくこちらを使用するようにした。
  - 意図としては、Dockerfile にベタ書きする必要もなく、ユーザ側でビルドする際に任意の値をオプションで指定できるようにした。
- マルチステージビルド
  - ビルドステージで `openssl passwd` コマンドを使用して、パスワードファイルを生成し、default.conf で指定したパスへコピーしている。
  - （この程度なら必要ないかもと思いつつ）

## 使い方

docker build 時に Basic 認証のユーザ名、パスワードを `--build-arg` オプションで渡す。

```sh
docker build -t ega4432/nginx-basic-auth:v0.1 \
    --build-arg BASIC_AUTH_USER="ega4432" \
    --build-arg BASIC_AUTH_PASSWORD="password" .

docker run -it --name nginx \
    --rm -p 8080:8080 ega4432/nginx-basic-auth:v0.1
```

## 確認

cURL で確認してみる。

### 通常アクセス

ちゃんと 401 が返ってきた！

```sh
curl -I localhost:8080
HTTP/1.1 401 Unauthorized
Server: nginx/1.23.1
Date: Sat, 08 Oct 2022 07:23:16 GMT
Content-Type: text/html
Content-Length: 179
Connection: keep-alive
WWW-Authenticate: Basic realm="Restriceted"
```

### 認証情報を付与してアクセス

`--user(-u)` オプションで認証情報を渡すと 200 が返ってきた！

```sh
curl -I -u ega4432:password localhost:8080
HTTP/1.1 200 OK
Server: nginx/1.23.1
Date: Sat, 08 Oct 2022 08:01:04 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Tue, 19 Jul 2022 14:05:27 GMT
Connection: keep-alive
ETag: "62d6ba27-267"
Accept-Ranges: bytes
```

ブラウザでも [localhost:8080](http://localhost:8080) にアクセスすると Basic 認証のポップアップが表示され、正しい認証情報を入力するとアクセスできた！

## まとめ

nginx コンテナで Basic 認証をかける方法についてまとめてみた。完全に自分用メモと言う感じで雑に書いてしまったが、どなたかのためになれればと思う。

## 参考

http://nginx.org/en/docs/http/ngx_http_auth_basic_module.html

https://hub.docker.com/_/nginx

https://qiita.com/nacika_ins/items/cf8ceb20711bd077f770

https://docs.docker.jp/engine/reference/commandline/build.html#build-arg
