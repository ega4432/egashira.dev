---
title: "動画から音声だけを抽出する"
date: "2023-06-09"
tags: ["Productivity"]
draft: false
summary: "よくやるので備忘録として"
---

## やり方

ffmpeg を使う。

https://ffmpeg.org/

```bash
# mac
brew install ffmpeg

# Ubuntu
sudo apt install -y ffmpeg
```

## コマンド

```bash
ffmpeg -i input.mp4 -f mp3 -nv output.mp3
```

- `-i` :　インプットファイルのパス、URL を指定
- `-f` :　フォーマットする形式を指定
- `-nv` : 動画を取り除く

あとは speech-to-text などに投げればテキストを抽出したりできる。
