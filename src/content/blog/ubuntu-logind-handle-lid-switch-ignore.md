---
createdAt: "2023-12-13T07:44:00.000Z"
updatedAt: "2024-06-16T06:03:00.000Z"
summary: "Ubuntu をノート PC でクラムシェルモードみたいに使ったり、サーバとして使ったりする際のメモ"
tags:
  - "Linux"
  - "Ubuntu"
  - "Tips"
date: "2024-06-16"
draft: false
title: "Ubuntu のノート PC を閉じてもスリープさせない設定"
---

## はじめに

ノートパソコンをクラムシェルモード（画面を閉じた状態）で使いたい場合や、Ubuntuをサーバーとして運用する際に、画面を閉じたときにスリープ状態に入らないように設定したいことがある。デフォルト設定では、ノートPCの蓋を閉じるとスリープに入るため、これを防ぐ設定方法をまとめた。

## TL;DR

結論から言うと、設定ファイルの一箇所を変えるだけで対応できる。

```sh
sudo vim /etc/systemd/logind.conf
```

以下のコメントアウトを外し、`HandleLidSwitch` の値を `ignore` に変える。

```systemd title="/etc/systemd/logind.conf" showLineNumbers
# HandleLidSwitch=suspend # デフォルトは "suspend" に設定されている
HandleLidSwitch=ignore
```

この設定で、ノートPCの蓋を閉じてもスリープに入らず動作を続ける。

設定変更後は、以下のコマンドで systemd-logind サービスを再起動し、システムを再起動する。

```sh
sudo systemctl restart systemd-logind
sudo reboot
```

## クラムシェルモードとは？

クラムシェルモードとは、ノートPCの蓋を閉じた状態でも外部ディスプレイやキーボード、マウスを使って操作を続けられるモードのこと。これにより、ノートPCをデスクトップのように使える。特にサーバー用途や作業スペースの省スペース化に便利だ。

## なぜこの設定が必要か？

Ubuntuのデフォルト設定では、蓋を閉じるとスリープ状態に入るため、クラムシェルモードでの利用やサーバー運用時に問題が起きる。`HandleLidSwitch=ignore` に設定することで、蓋を閉じてもスリープに入らず、常に稼働し続ける。

## トラブルシューティング

- 設定を変えても反映されない場合は、`systemd-logind` サービスの再起動とシステムの再起動を行う。
- 他の電源管理設定やデスクトップ環境の設定が影響している場合もあるため、必要に応じて確認する。

## 参考

https://amzn.to/3M4C8Mt

https://amzn.to/3KdaHj1
