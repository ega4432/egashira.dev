---
createdAt: "2023-04-06T13:50:00.000Z"
updatedAt: "2023-04-08T09:49:00.000Z"
summary: "処理をまとめて再利用可能なかたちで定義できる機能があるみたいなので使ってみた。"
tags:
  - "GitHub Actions"
  - "GitHub"
date: "2023-04-08"
draft: false
title: "GitHub Actions で composite action を使ってリファクタリングする"
---

## はじめに

GitHub Actions で composite action なるものが 1 年ほど前にリリースされていたが使えてなかったので使ってみた。

[https://docs.github.com/en/actions/creating-actions/creating-a-composite-action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)

npm エコシステムでは `npm install` や `npm run xxx` みたいなコマンドを実行するようなアクションを毎回定義しては似たような YAML ファイルが増えていた。今回は composite action を利用してリファクタリングしてみる。

## composite action を作る

`.github/actions/npm/action.yaml` を作成し、共通箇所を抜き出した。

```yaml
inputs:
  node-version-file:
    required: false
    default: ".tool-versions"
  cache:
    required: false
    default: "npm"
  cache-dependency-path:
    required: false
    default: "./package-lock.json"

runs:
  using: "composite"
  steps:
    - name: Setup node
      uses: actions/setup-node@v3
      with:
        node-version-file: ${{ inputs.node-version-file }}
        cache: ${{ inputs.cache }}
        cache-dependency-path: ${{ inputs.cache-dependency-path }}
    - name: Install dependencies
      shell: bash
      run: npm ci
```

ポイントとしては以下になる。

- `using` 句では `compose` を指定する。
- `inputs` 句で composite action 側にパラメータを渡すことができる。
  - 詳細としては他にも `require`, `default` , `description` が指定できる。
  - [https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#inputs](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#inputs)
- `run` 句では `shell` の設定が必須となっている。
  - [https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runsstepsshell](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runsstepsshell)

## composite action を使う

ここでは、例として `.github/workflows/ci.yaml` という CI 用に定義しておいた action ファイルを上記で作成した composite action を使用するように修正した。

```yaml
name: "build"

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 3

    steps:
      - name: Checkout source
        uses: actions/checkout@v3
        with:
          ref: ${{ github.head_ref }}

+     - name: Initialize node & npm
+       uses: ./.github/actions/npm

-     - name: Setup node
-       uses: actions/setup-node@v3
-       with:
-         node-version-file: ${{ inputs.node-version-file }}
-         cache: ${{ inputs.cache }}
-         cache-dependency-path: ${{ inputs.cache-dependency-path }}
-
-     - name: Install dependencies
-       run: npm ci

      - name: Execute prettier
        run: npm run prettier

      - name: Execute eslint
        run: npm run eslint

      - name: Build
        run: npm run build
```

`uses`句で作成した composite action のファイルパスを指定する。

注意点としてはリポジトリにチェックアウトする最初の処理も共通化したいところだが、composite action 自体がこのリポジトリに含まれるのでこれを共通化することはできない。

## まとめ

これだけで composite action を利用でき、毎回書いていた共通処理をまとめることができた！

## 参考

[https://docs.github.com/en/actions/creating-actions/creating-a-composite-action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)

[https://docs.github.com/ja/actions/using-workflows/reusing-workflows](https://docs.github.com/ja/actions/using-workflows/reusing-workflows)

[https://zenn.dev/stafes_blog/articles/ikkitang-a694b8afeb66f5](https://zenn.dev/stafes_blog/articles/ikkitang-a694b8afeb66f5)

[https://tsgcpp.hateblo.jp/entry/2022/09/25/135115](https://tsgcpp.hateblo.jp/entry/2022/09/25/135115)
