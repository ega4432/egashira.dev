---
title: 当サイトのブログ記事の校正のため textlint を導入した
date: "2022-08-27"
tags: ["npm", "textlint", "GitHub Actions", "Productivity", "Update"]
draft: false
summary: textlint を導入した際の手順や設定などのメモ
---

## はじめに

textlint を導入し、このサイトのブログ記事を校正するようにした。その時の手順や設定、今後の課題などを書いておく。

## textlint とは

そもそも textlint とは、静的解析ツールの 1 つで定義したルールに従って文章を校正してくれる。「pluggable」と謳っている通り、ユースケースに応じてプラグインを追加してルールをカスタマイズして、かなり柔軟に活用できる。

[textlint/textlint: The pluggable natural language linter for text and markdown\.](https://github.com/textlint/textlint)

まず、以下のコマンドでインストールする。

```shell
$ npm i --save-dev textlint
```

### ルールプリセットのインストール

このサイトは技術ブログということで、技術文書向けのルールリプセットを導入する。

[textlint\-ja/textlint\-rule\-preset\-ja\-technical\-writing: 技術文書向けの textlint ルールプリセット](https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing)

```shell
$ npm i --save-dev textlint-rule-preset-ja-technical-writing
```

プロジェクト直下に設定ファイルを作成し、以下のルールプリセットを有効化する。

```json:.textlintrc showLineNumbers
{
  "rules": {
    "preset-ja-technical-writing": true
  }
}
```

この状態で一旦実行してみる。

```shell
$ npx textlint "./path/to/contents"
```

結果ものすごい量のエラーが出た。

全然意識せずに記事を書いてきたせいか無法地帯となっていた。しかし、導入時に出て全てに対応するのは時間がかかりすぎてしまうため、一旦は設定を入れ緩和する方針にした。

### 現時点での最終盤

まず、細かい設定よりもはじめに結論から。~現時点ではミニマムで始めることを優先すると以下のようになった。~ **2023 年 1 月現在**での状態がこちら。詳しい解説については後述する。

```json:.textlintrc showLineNumbers
{
  "rules": {
    "preset-ja-technical-writing": {
      "sentence-length": {
        "max": 150
      },
      "no-exclamation-question-mark": false,
      "ja-no-weak-phrase": false,
      "ja-no-mixed-period": {
        "allowPeriodMarks": [
          "笑",
          "…",
          ":"
        ],
        "allowEmojiAtEnd": true
      },
      "max-kanji-continuous-len": {
        "max": 7
      }
    }
  },
  "filters": {
    "comments": true,
    "allowlist": {
      "allow": [
        "/\\$\\$[\\s\\S]*?\\$\\$/m",
        "/^\\>.*$/m"
      ]
    }
  }
}

```

## 細かい設定

> 次のように "preset-ja-technical-writing" 以下にそれぞれのオプション値を指定することで、設定を変更できます。 各ルールの設定できるオプションは、各ルールの README を参照してください。

上記のように [textlint の README](https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing#%E3%83%AB%E3%83%BC%E3%83%AB%E3%81%AE%E8%A8%AD%E5%AE%9A%E6%96%B9%E6%B3%95) にある通り設定を追加していく。

### 感嘆符!！、感嘆符?？を許容する

[textlint\-rule/textlint\-rule\-no\-exclamation\-question\-mark: textlint rule that disallow exclamation and question mark\.](https://github.com/textlint-rule/textlint-rule-no-exclamation-question-mark)

```shell
$ npm i --save-dev textlint-rule-no-exclamation-question-mark
```

`!` , `！` , `?` , `？` をとりあえず全て許可。

```json:.textlintrc showLineNumbers {4}
{
  "rules": {
    "preset-ja-technical-writing": {
      "no-exclamation-question-mark": false,
    }
  }
}
```

### 文末で「。」以外を許容する

[textlint\-ja/textlint\-rule\-ja\-no\-mixed\-period: 文末の句点\(。\)の統一 と 抜けをチェックする textlint ルール](https://github.com/textlint-ja/textlint-rule-ja-no-mixed-period)

```shell
$ npm i --save-dev textlint-rule-ja-no-mixed-period
```

`。` 以外に文末で使用可能な文字を `allowPeriodMarks` に定義する。絵文字も使うので許可。

```json:.textlintrc showLineNumbers {4-7}
{
  "rules": {
    "preset-ja-technical-writing": {
      "ja-no-mixed-period": {
        "allowPeriodMarks": ["笑", "…", ":"],
        "allowEmojiAtEnd": true
      }
    }
  }
}
```

### 長い文章を許容する

[textlint\-rule/textlint\-rule\-sentence\-length: textlint rule that limit maximum length of sentence\.](https://github.com/textlint-rule/textlint-rule-sentence-length)

```shell
$ npm i --save-dev textlint-rule-sentence-length
```

デフォルトだと 100 文字で短めなので緩和する。

```json:.textlintrc showLineNumbers {4-6}
{
  "rules": {
    "preset-ja-technical-writing": {
      "sentence-length": {
        "max": 150
      }
    }
  }
}
```

### 弱い日本語表現を許容する

[textlint\-ja/textlint\-rule\-ja\-no\-weak\-phrase: 弱い表現の利用を禁止する textlint ルール](https://github.com/textlint-ja/textlint-rule-ja-no-weak-phrase)

```shell
$ npm i --save-dev  textlint-rule-ja-no-weak-phrase
```

割と `〜思う` などを使用していたのと、当サイトは個人ブログであり論文などと比べそこまで厳密でもないため許容する。

```json:.textlintrc showLineNumbers {4}
{
  "rules": {
    "preset-ja-technical-writing": {
      "ja-no-weak-phrase": false
    }
  }
}
```

### 数式を無視する

[textlint/textlint\-filter\-rule\-allowlist: textlint filter rule that filters any word by allowing lists\.](https://github.com/textlint/textlint-filter-rule-allowlist)

```shell
$ npm i --save-dev textlint-filter-rule-allowlist
```

当サイトは、数式のレンダリングに KaTeX を使用しているため数式と引用文は除外するようにした。

```json:.textlintrc showLineNumbers {3-8}
{
  "rules": {},
  "filters": {
    "allowlist": {
      "allow": [
        "/\\$\\$[\\s\\S]*?\\$\\$/m",
        "/^\\>.*$/m"
      ]
    }
  }
}
```

今回は、textlint の作者 azu さんのこちらの記事を参考にさせていただいた。

[textlint で特定のルールのエラーを無視する \- Qiita](https://qiita.com/azu/items/0f8ca9f1fd531d6b2f4b)

### 任意のファイル・ディレクトリを無視する

[textlint 11\.9\.0 \.textlintignore の無視ファイルをサポート \| Web Scratch](https://efcl.info/2021/03/21/textlintignore/)

ある特定のファイルの静的解析を除外したかった。

除外リストについては `.textlintignore` ファイルを作成し、そこに記載すると無視される。

```text:.textlintignore showLineNumbers
i-want-to-ignore.md
ignore-directory/
```

## GitHub Actions での CI

こんな感じの YAML を書いて main ブランチへの Pull Request の度に textlint を実行するようにした。

```yaml:.github/workflows/ci.yaml
name: CI

on:
  pull_request:
    branches:
      - 'main'

jobs:
  ci:
    name: lint
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: 'npm'
      - run: npm ci --ignore-scripts
      - run: npx textlint "./path/to/contents"
```

## 今後の課題

### コメントにより静的解析を一時的に無視する

[公式ドキュメント](https://textlint.github.io/docs/ignore.html) を見ると、textlint は `.textlintignore` 以外にもコメントによる一時的な無視もサポートしている。

しかし、ここで問題となるのが mdx-bundler[^1] のシンタックスが Markdown のコメント記法と異なることだ。（コードシンタックスもロウライトされていない…）

```markdown
<!-- 従来の Markdown でのコメント -->

{/** mdx-bundler でのコメント **/}
```

本来であれば下記のプリセットを使用して有効化できるが、上記の問題を回避するため何かしら対策する必要がある。

[textlint/textlint\-filter\-rule\-comments: textlint filter rule that disables all rules between comments directive\.](https://github.com/textlint/textlint-filter-rule-comments)

### 表記ゆれを検知する

ゼロから定義していくのは時間がかかりそうだと思ったので、二次対応とした。ただ、表記ゆれがあると読み手の理解を阻害したり、困惑を与えたりするため今後対応したい。

以下のプラグインを使うと良さそう。

[textlint\-rule/textlint\-rule\-prh: textlint rule for prh\.](https://github.com/textlint-rule/textlint-rule-prh)

## まとめ

今回は、textlint を導入してみた！

これまではプレビュー環境で記事を読み返してタイポがないか、日本語としておかしい文がないかなど確認していた。毎回この確認作業を行うのは面倒だし、ある程度自動でチェックしてくれるのには執筆体験の向上を感じる。今後はもっときれいな文章を書いていきたい！

## 参考

https://efcl.info/2016/07/13/textlint-rule-preset-ja-technical-writing/

https://marketplace.visualstudio.com/items?itemName=taichi.vscode-textlint

[^1]: 当サイトで利用している markdown を html にパースするライブラリ。
