---
title: npm install で実行される npm-script を ignore-scripts オプションで無視する
date: "2022-08-06"
tags: ["npm", "Node", "Docker", "Container"]
draft: false
summary: npm prepare などのスクリプトを意図して無視したい場合のオプションの紹介
---

## はじめに

npm 管理化のアプリをコンテナ化する際、docker build でエラーとなったのでメモがてら原因と解決策をまとめる。以下の条件に当てはまる場合発生するっぽい。

- npm prepare が npm-scripts に設定してある
- husky など上記の npm prepare で使用しているライブラリが devDependencies にあり Dockerfile では devDependencies をインストールしないようにしている

実際のエラーはこんな感じ。

```shell
$ docker build -t react-app .
[+] Building 53.2s (8/10)
 => [internal] load build definition from Dockerfile                                                                  0.3s
 => => transferring dockerfile: 37B                                                                                   0.2s
 => [internal] load .dockerignore                                                                                     0.4s
 => => transferring context: 112B                                                                                     0.3s
 => [internal] load metadata for docker.io/library/node:16.16.0-bullseye-slim                                         1.1s
 => [1/6] FROM docker.io/library/node:16.16.0-bullseye-slim@sha256:cda7229eb72b7534396e7b58ba5b9f2454aee188317e058cb  0.0s
 => [internal] load build context                                                                                     0.8s
 => => transferring context: 4.58MB                                                                                   0.7s
 => CACHED [2/6] WORKDIR /usr/local/app                                                                               0.0s
 => [3/6] COPY ./package*.json ./                                                                                     0.2s
 => ERROR [4/6] RUN npm install  --production                                                                         50.2s
------
 > [4/6] RUN npm install --production:
#8 48.98
#8 48.98 > sample-app@1.5.1 prepare
#8 48.98 > husky install
#8 48.98
#8 48.99 sh: 1: husky: not found
#8 48.99 npm notice
#8 48.99 npm notice New minor version of npm available! 8.11.0 -> 8.16.0
#8 48.99 npm notice Changelog: <https://github.com/npm/cli/releases/tag/v8.16.0>
#8 48.99 npm notice Run `npm install -g npm@8.16.0` to update!
#8 48.99 npm notice
#8 48.99 npm ERR! code 127
#8 48.99 npm ERR! path /usr/local/app
#8 48.99 npm ERR! command failed
#8 48.99 npm ERR! command sh -c husky install
#8 48.99
#8 48.99 npm ERR! A complete log of this run can be found in:
#8 48.99 npm ERR!     /root/.npm/_logs/2022-08-04T14_28_44_690Z-debug-0.log
------
executor failed running [/bin/sh -c npm install --production]: exit code: 127
```

## 原因

npm prepare が package.json の npm-script に定義されている場合、npm install をトリガに npm prepare が実行されてしまう。

> If the package being installed contains a prepare script, its dependencies and devDependencies will be installed, and the prepare script will be run, before the package is packaged and installed. -- ref. [npm\-install \| npm Docs](https://docs.npmjs.com/cli/v8/commands/npm-install)

package.json の一部を抜粋すると…

```json:package.json showLineNumbers {5}
{
  "name": "sample-app",
  "scripts": {
    "build": "next build",
    "prepare": "husky install" // npm install をトリガに実行される
    // ... 略 ...
  },
  "devDependencies": {
    "husky": "^7.0.0",
    // ... 略 ...
  }
}
```

また Dockerfile では devDependencies をインストールしないようにしていると husky がインストールされず `husky: not found` となる。

```Dockerfile:Dockerfile showLineNumbers {3}
...

RUN npm install --production

...
```

## 対策

本記事のタイトル通りだが ignore-scripts というオプションがあったので、それを使うと回避できる！

> If true, npm does not run scripts specified in package.json files.
>
> Note that commands explicitly intended to run a particular script, such as npm start, npm stop, npm restart, npm test, and npm run-script will still run their intended script if ignore-scripts is set, but they will not run any pre- or post-scripts. - ref. [npm\-install \| npm Docs](https://docs.npmjs.com/cli/v8/commands/npm-install#ignore-scripts)

```diff:Dockerfile showLineNumbers
...

- RUN npm install --productio
+ RUN npm install --production --ignore-scripts

...
```

上記のオプションを入れると無事に docker build が成功する。

```shell
$ docker build -t sample-app --no-cache .
[+] Building 383.4s (11/11) FINISHED
 => [internal] load build definition from Dockerfile                                                                  0.1s
 => => transferring dockerfile: 313B                                                                                  0.1s
 => [internal] load .dockerignore                                                                                     0.0s
 => => transferring context: 2B                                                                                       0.0s
 => [internal] load metadata for docker.io/library/node:16.16.0-bullseye-slim                                         1.2s
 => [1/6] FROM docker.io/library/node:16.16.0-bullseye-slim@sha256:cda7229eb72b7534396e7b58ba5b9f2454aee188317e058cb  0.0s
 => [internal] load build context                                                                                     8.3s
 => => transferring context: 3.24MB                                                                                   7.9s
 => CACHED [2/6] WORKDIR /usr/local/app                                                                               0.0s
 => [3/6] COPY ./package*.json ./                                                                                     1.0s
 => [4/6] RUN npm install --production --ignore-scripts                                                              96.0s
 => [5/6] COPY ./ ./                                                                                                 18.0s
 => [6/6] RUN npm run build                                                                                         225.7s
 => exporting to image                                                                                               32.4s
 => => exporting layers                                                                                              32.3s
 => => writing image sha256:fccc09cf65b8e3a429c177b9b0023be30b8537049366e723b537ebd3b0b291c8                          0.0s
 => => naming to docker.io/library/sample-app                                                                               0.0s

Use 'docker scan' to run Snyk tests against images to find vulnerabilities and learn how to fix them
```

## まとめ

npm など日頃から使い慣れているツールだと思っていたが、こんなオプションがあるとは知らなかった！
また、npm install の際に prepare が実行されるなどライフサイクルを知っていないと沼にハマりそうだなと思ったので、この記事をまとめてみた。

また今回は例として prepare を取り上げたが、おそらく postinstall, prepublish などの npm-script も該当すると思う。npm-scripts については下記のドキュメントを見るとだいたい分かるので是非参考にして欲しい。

https://docs.npmjs.com/cli/v8/using-npm/scripts

## 参考

https://docs.npmjs.com/cli/v8/commands/npm-install

https://docs.npmjs.com/cli/v8/using-npm/scripts

https://github.com/npm/cli

https://qiita.com/ndxbn/items/f0cd2b13a3268254f2aa#%E8%AA%BF%E6%9F%BB%E5%86%85%E5%AE%B9
