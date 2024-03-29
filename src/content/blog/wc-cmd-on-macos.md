---
createdAt: "2023-02-19T14:29:00.000Z"
updatedAt: "2023-03-22T16:25:00.000Z"
summary: "あるあるなことなので備忘に"
tags:
  - "macOS"
  - "Linux"
date: "2023-03-04"
draft: false
title: "mac の wc が無駄なスペースを含んでくる"
---

## wc の mac/Linux 間での挙動の違い

自作 GitHub Actions で mac/win などの runner も対応させたいなと思って対応していた際に遭遇したのでメモ。早速 macos-latest でエラーになったので調べているとどうやら `wc -l` を含むシェルでエラーになっていた。

ググるとすぐに以下の記事が見つかった。

[Linux の wc コマンドを mac OS Catalina で使い、csv ファイルの行数をカウントしたい。](https://teratail.com/questions/242245)

これまでは、標準出力させたもの（行数など）を数える際、脳死で `wc -l` を使っていたが、どうやら macOS に搭載されている wc コマンドの挙動が若干 Linux のそれとは異なり、スペースを含んでしまう。

- Linux

```bash
$ echo -e "hoge\nfuga" | wc -l
2
```

- mac

```bash
$ echo -e "hoge\nfuga" | wc -l
       2
```

### 対策

`wc - l | tr -d ' '` とパイプで tr に渡してスペースを消してあげれば良い。他にもこうやればいいよというのがあれば Twitter などで教えていただけると大変ありがたい 🙏
