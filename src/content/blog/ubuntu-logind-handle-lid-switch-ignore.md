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

いきなり結論だが、一箇所設定を変えるだけ。

```bash
sudo vim /etc/systemd/logind.conf
```

以下のコメントアウトを外す（修正する）だけ。

```bash
# HandleLidSwitch=suspend # デフォルトだと "suspend" になっている
HandleLidSwitch=ignore
```

あとは再起動すれば設定が反映される。

```bash
sudo systemctl restart systemd-logind
sudo reboot
```
