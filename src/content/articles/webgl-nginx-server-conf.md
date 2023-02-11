---
title: WebGL ビルドしたコンテンツを nginx で配信する
date: "2023-01-20"
tags: ["nginx", "Unity", "Wasm", "WebGL"]
draft: false
summary: WebGL ビルドしたコンテンツを配信する際に工夫したこと
---

## はじめに

タイトルの通り Unity で開発したものを WebGL 形式でビルドし、nginx で配信する際にやったことを簡単にまとめておく。

## Unity で WebGL

Unity は PC、モバイルアプリなど各プラットフォームをサポートしている。もちろんブラウザアプリとして WebGL にも対応しており、ゲームや 3 次元アプリケーションを HTML へレンダリングできる。

## 使用した React ライブラリ

今回は、WebGL を埋め込むフロントエンドとして React を選定し、以下のライブラリを使用した。

https://github.com/jeffreylanters/react-unity-webgl

事前に Unity でビルドしたコンテンツをこんな感じで `public/build` に置いておけばローカルでもすぐに確認できる。非常に便利だ！

```js:App.js showLineNumbers
import { Unity, useUnityContext } from "react-unity-webgl"

function App() {
  const { unityProvider } = useUnityContext({
    loaderUrl: "build/xxx.loader.js",
    dataUrl: "build/xxx.data",
    frameworkUrl: "build/xxx.framework.js",
    codeUrl: "build/xxx.wasm"
  })

  return <Unity unityProvider={unityProvider} />
}
```

## nginx コンテナで配信

React を SPA としてビルドしたものを配信するサーバとして nginx を選定した。さらによりポータビリティを考慮してコンテナしてみた。その際の Dockerfile は以下を参照してもらえたらと思う。

```Dockerfile:Dockerfile showLineNumbers
FROM docker.io/library/node:18.12.1-slim AS builder
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY ./ ./
RUN npm run build

FROM docker.io/library/nginx:1.23.3
COPY --from=builder /app/build /usr/share/nginx/html/            # ビルドした静的コンテンツをコピー
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf  # 設定するものがあれば
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf             # 設定するものがあれば
RUN chown -R nginx:nginx /var/cache/nginx && \
  chmod -R g+w /var/cache/nginx
USER nginx
EXPOSE 8080
CMD [ "nginx", "-g", "daemon off;" ]
```

ビルドして起動する。

```shell
$ docker build --no-cache -t nginx-webgl:v0.1 -f ./docker/Dockerfile .

$ docker run -itd --name test --rm -p 8080:8080 nginx-webgl:v0.1
```

正常に起動できたら [localhost:8080](http://localhost:8080) にアクセスするとブラウザで動作を確認できる。

ただし、3 次元コンテツの読み込みに結構時間がかかっていた。developer tool のネットワークタブを見てみると、以下のように WebGL 関連の読み込みに非常に時間を要していた。

![screenshot of before](https://i.imgur.com/aBk6kkj.webp)

## gzip 圧縮でパフォーマンスを微改善

nginx のチューニングでよくやる手法。公式のドキュメントを見ると、WebGL ビルド時の圧縮方式についての記載があったので gzip 形式で圧縮ビルドしてみた。

https://docs.unity3d.com/Manual/webgl-deploying.html

圧縮の設定を変更するには `Build Settings` > `Player Settings` > `Player` へ進み、赤枠の部分を指定し、もう一度ビルドするだけだ。

![screenshot of unity build setting](https://i.imgur.com/StvO9DX.webp)

そして、nginx が圧縮済みのコンテンツを返却できるように設定ファイル `./docker/nginx/default.conf` に追記する。以下の公式のドキュメントを参考にした。

https://docs.unity3d.com/Manual/webgl-server-configuration-code-samples.html

```conf:./docker/nginx/default.conf showLineNumbers {11-32}
server {
  listen       8080;
  server_name  localhost;

  location / {
      root   /usr/share/nginx/html;
      index  index.html index.htm;
      # Add for single page application
      try_files $uri /index.html;

    # On-disk gzip-precompressed data files should be served with compression enabled:
    location ~ .+\.(data|symbols\.json)\.gz$ {
      gzip off; # Do not attempt dynamic gzip compression on an already compressed file
      add_header Content-Encoding gzip;
      default_type application/gzip;
    }

    # On-disk gzip-precompressed JavaScript code files:
    location ~ .+\.js\.gz$ {
      gzip off; # Do not attempt dynamic gzip compression on an already compressed file
      add_header Content-Encoding gzip; # The correct MIME type here would be application/octet-stream, but due to Safari bug https://bugs.webkit.org/show_bug.cgi?id=247421, it's preferable to use MIME Type application/gzip instead.
      default_type application/javascript;
    }

    # On-disk gzip-precompressed WebAssembly files:
    location ~ .+\.wasm\.gz$ {
      gzip off; # Do not attempt dynamic gzip compression on an already compressed file
      add_header Content-Encoding gzip;
      # Enable streaming WebAssembly compilation by specifying the correct MIME type for
      # Wasm files.
      default_type application/wasm;
    }
  }
}
```

もう一度コンテナをビルドし直して確認する。

![screenshot of after](https://i.imgur.com/Wq487bD.webp)

若干だが改善されたのが分かる。

## まとめ

WebGL ビルド時に gzip 圧縮することでコンテンツの配信速度を劇的に改善できた！まだまだ Unity, WebGL についてはキャッチアップ中なのでどんどん触って、得た知見をアウトプットできたらと思う。

## 参考

https://docs.unity3d.com/Manual/webgl-server-configuration-code-samples.html

https://zenn.dev/ushibutatory/articles/b7de39120ba9eff95edb
