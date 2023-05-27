---
createdAt: "2023-05-18T14:48:00.000Z"
updatedAt: "2023-05-27T06:24:00.000Z"
summary: "Ubuntu のクリーンインストールに向けてやったことを自分用の備忘録として残しておく"
tags:
  - "Linux"
  - "Ubuntu"
date: "2023-05-27"
draft: false
title: "Ubuntu のブータブル USB を作る"
---

## 必要なもの

- ブータブル USB 作成用の PC
  - 今回は mac book pro を使用した。
- USB メモリ
  - インストール ISO が数 GB あるので 8GB 以上のものを用意しておくと安心だろう。

## 手順

### 1. balenaEtcher のインストール

今回は macOS でブート USB を焼くので対応している balenaEtcher をインストールする。

1. balenaEtcher の公式サイト（[https://www.balena.io/etcher/](https://www.balena.io/etcher/)）にアクセスし、ダウンロードする。
2. ダウンロードが完了したら、インストーラーを開いてインストールする。

### 2. Ubuntu の ISO イメージのダウンロード

1. Ubuntu 公式サイトのダウンロードページ（[https://ubuntu.com/download/desktop](https://ubuntu.com/download/desktop)）を開き、現時点での LTS である Ubuntu 22.04 の ISO イメージをダウンロードする。
   1. “Recommended system requirements” にマシン要件が書かれているのでインストールしようとしている PC が対応しているか確認しておくといいだろう。

### 3. balenaEtcher を使用してブータブル USB を作成

1. balenaEtcher を起動する。
2. "Select image"（イメージを選択）ボタンをクリックし、先ほどダウンロードした Ubuntu 22.04 LTS の ISO イメージを選択する。
3. "Select target"（ターゲットを選択）ボタンをクリックし、ブータブル USB として使用する USB ドライブを選択する。注意: USB ドライブには重要なデータがないことを確認すること。
4. USB ドライブが正しく選択されたことを確認したら、"Flash!"（フラッシュ）ボタンをクリックする。
5. balenaEtcher は ISO イメージを USB ドライブに書き込む（このステップは数分かかった）。
6. プロセスが完了したら、balenaEtcher は自動的に USB ドライブを確認する。USB ドライブが正常に作成されたかどうかを確認するために検証が実行される。

以上で Ubuntu をインストールする準備は最低限整った。インストールしたらまたブログ書く。
