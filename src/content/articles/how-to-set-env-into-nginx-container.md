---
title: nginx コンテナ起動時に環境変数を渡す方法【2023 年版】
date: "2023-01-29"
tags: ["nginx", "Container", "Docker"]
draft: false
summary: 調べるといろんな記事が出てくるがやり方が変わっていたのでまとめてみた
---

## はじめに

nginx コンテナを建てる際に、どうやって設定ファイルに環境変数を渡すかやってみたのでまとめてみる。

今回使用したものは以下になる。

- Docker Engine
  - Docker Desktop v4.16.2
- nginx base image
  - nginx:1.23.3

## 結論

最初に結論を言うと、以下 2 つを行えば実現できる。後ほど順を追って説明する。

- 設定ファイル用のテンプレートを作成し `${ENV}` 形式で記載
- コンテナ起動時に環境変数を渡す（`docker run --env`）

:no_entry_sign: Dockerfile の CMD 命令で [envsubst している記事が散見される](https://www.google.com/search?q=docker+nginx+envsubst) が v1.19 以降の公式のイメージでは不要になった。
そういう意図も込めてタイトルに 【2023 年版】 などと付けてみた笑

## 設定のテンプレートファイルを作成

公式の nginx イメージを使う場合、デフォルトで `/etc/nginx/templates/*.template` の設定ファイルに対して envsubst を実行して `/etc/nginx/conf.d/*.conf` へ出力するようになっている。そのためまずは、以下のようなテンプレートファイルを作成する。

```conf:default.conf.template showLineNumbers {14}
server {
    listen       80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    # 省略

    location /proxy {
        rewrite    /proxy / break;
        proxy_pass https://${PROXY_URL};
    }
}
```

あとで確認しやすいように、特定のパスへのリクエストをプロキシさせるような設定にしてみた。

## nginx コンテナを起動

ポイントとしては、`--volume` オプションで先程作成したテンプレートファイルをマウントしている点と、`--env` オプションで環境変数を渡している点である。

```shell {2-3,12}
docker run --rm --interactive --tty --name nginx-env --publish 80:80 \
  --volume $(pwd)/default.conf.template:/etc/nginx/templates/default.conf.template:ro \
  --env "PROXY_URL=www.google.com" \
  nginx:1.23.3

/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
20-envsubst-on-templates.sh: Running envsubst on /etc/nginx/templates/default.conf.template to /etc/nginx/conf.d/default.conf
/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
/docker-entrypoint.sh: Configuration complete; ready for start up
2023/01/29 08:22:43 [notice] 1#1: using the "epoll" event method
2023/01/29 08:22:43 [notice] 1#1: nginx/1.23.3
2023/01/29 08:22:43 [notice] 1#1: built by gcc 10.2.1 20210110 (Debian 10.2.1-6)
2023/01/29 08:22:43 [notice] 1#1: OS: Linux 5.15.49-linuxkit
2023/01/29 08:22:43 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1048576:1048576
2023/01/29 08:22:43 [notice] 1#1: start worker processes
2023/01/29 08:22:43 [notice] 1#1: start worker process 34
2023/01/29 08:22:43 [notice] 1#1: start worker process 35
```

上記の起動ログのハイライト箇所を見ても、テンプレートファイルに対して envsubst を実行し設定ファイルを生成しているのが確認できる。

`--env` オプションで与えたものが正しく設定されているかは以下のコマンドで確認できる（grep して見たいものだけ出力した）。

```shell
docker exec -it nginx-env cat /etc/nginx/conf.d/default.conf | grep -A2 -m1 proxy
    location /proxy {
        rewrite    /proxy / break;
        proxy_pass https://www.google.com;
```

`proxy_pass https://${PROXY_URL};` とした箇所が `proxy_pass https://www.google.com;` に置き換わっており期待した挙動になっている。

もちろんブラウザで [localhost](http://localhost) を開くと、nginx のデフォルトの画面が表示されるし、[localhost/proxy](http://localhost/proxy) を開くと、Google の検索画面にプロキシされる。

## まとめ

nginx コンテナに環境変数を渡すということ自体は結構やることなので、一旦まとめてみた。**コンテナ内には環境変数のような秘匿情報を埋め込まないのがベストプラクティスとされている**ので今後も気をつけて実装したい。

今回の記事が今後の自分や他の誰かの参考になったらと思う。

## 参考

https://hub.docker.com/_/nginx

https://github.com/nginxinc/docker-nginx/blob/master/stable/debian/20-envsubst-on-templates.sh

https://ryosms.livedoor.blog/archives/9521735.html

https://manpages.ubuntu.com/manpages/trusty/man1/envsubst.1.html
