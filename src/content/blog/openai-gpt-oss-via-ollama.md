---
title: "ローカルで動く OpenAI の大規模言語モデル「gpt-oss」を Ollama で実際に使ってみた"
date: "2025-08-16"
tags: ["AI", "GPT", "OpenAI", "Ollama"]
draft: false
summary: "Apple M1 Macで動作する OpenAI のオープンソース大規模言語モデル「gpt-oss」を、Ollama を使って実際に試した"
---

## はじめに

本記事では、Apple M1 MacBook Pro 上でローカルに動作する大規模言語モデル（LLM）「gpt-oss」を、Ollama を利用して試してみたので紹介する。

今回、使用した端末は以下の通りである。

- MacBook Pro 16 インチ
- チップ: M1 Max
- メモリ: 32 GB

## gpt-oss の概要

gpt-oss は OpenAI が Apache 2.0 ライセンスで公開したオープンソースの大規模言語モデル（LLM）である。大規模な事前学習を経ており、高度な自然言語処理能力を持ちながら、ローカル環境で動作可能なように最適化されている。

https://openai.com/ja-JP/index/introducing-gpt-oss/

https://github.com/openai/gpt-oss

モデルアーキテクチャは効率的なトランスフォーマーベースで設計されており、M1 Max などの Apple シリコン上で高速な推論を実現する。これにより、クラウドに依存せずにプライバシーを保ちながら利用できる点が大きな特徴である。

オープンモデルであることは、開発者や研究者が自由にモデルを検証・改良できることを意味し、AI 技術の透明性と民主化に寄与する。gpt-oss はこうしたオープンな取り組みの一環として位置づけられている。

OpenAI は gpt-oss を通じて、開発者が自分の環境で安全かつ効率的に大規模言語モデルを利用できることを目指している。軽量化と最適化によりローカルでの高速推論が可能であり、コミュニティによる改善や拡張も期待されている。

gpt-oss には 20b と 120b のモデルがあり、20b はローカル環境での高速推論に最適化されている一方、120b はより大規模で高度な処理能力を持つモデルである。今回は、自分の環境の制約上 20b で試したので。

## ローカル LLM について

ローカル LLM（大規模言語モデル）は、ユーザーの端末や社内サーバーなどクラウド外の環境で動作する言語モデルを指す。クラウドベースの LLM と比較して、以下のような特徴がある。

- プライバシー保護
- 低遅延・高速応答
- コスト削減
- カスタマイズ性

一方で、ローカル環境の計算資源に依存するため、高性能なハードウェアが必要となる場合がある。しかし、Apple の M1/M2 チップのような高性能なチップの登場により、個人でもローカル LLM を活用しやすくなっている。

ローカル LLM は、プライバシー重視の業務用途や、ネットワーク環境が限定される場面、そして開発者の実験環境として今後ますます注目される技術である。

Kindle で下記の書籍がセールになっているので、ローカル LLM についてもっと深堀りしたい場合は読んでみると良いと思う。私も今読んでいるところである。

https://amzn.to/4luvdYK

https://amzn.to/4lrOuKF

## Ollama について

Ollama はローカルで LLM を管理・実行するためのツールである。特に Apple の M1/M2 チップに最適化されており、高速かつ効率的にモデルを動作させることができる。複数のモデルを簡単にインストール・切り替えできるため、用途に応じて柔軟に使い分けが可能である。

CLI と GUI の両方のインターフェースを備えており、初心者から上級者まで幅広いユーザーに対応している。CLI ではスクリプトや自動化に組み込みやすく、GUI では直感的な操作が可能である。

また、Ollama は API も提供しており、プログラムからローカル LLM を呼び出すことができる。これにより、独自のアプリケーションやサービスにローカル LLM を組み込むことが容易になる。

さらに、Ollama はモデルのバージョン管理やアップデートもサポートしており、常に最新の状態で利用できるようになっている。セキュリティ面でもローカルで完結するため、データの漏洩リスクを抑えられる。

このように Ollama は、ローカル LLM の導入と運用をシンプルかつ効率的にするための強力なツールとして注目されている。

次章では、実際に gpt-oss モデルを Ollama で導入し、動作させる手順を紹介する。

## gpt-oss の使い方

今回の検証では、gpt-oss:20b モデルを使用した。以下の手順で Ollama を使ってモデルを導入し、動作させることができる。

### Ollama のインストール

私は CLI で操作する方が好きなので、Homebrew 経由でインストールした。

```sh
$ brew install ollama
```

Ollama には様々なインストール方法が提供されているため、ご自身の環境に合う方法を選択してほしい。

### Ollama の起動

まず、以下のコマンドで Ollama サーバーを起動する。

```sh
$ ollama serve
Couldn't find '/Users/ega4432/.ollama/id_ed12345'. Generating new private key.
Your new public key is:

ssh-ed25519 AAAABBBCCCCCCC1234AAABBBcccc5555555+eeefffHHHHHggggggggg6789

time=2025-08-15T10:31:03.103+09:00 level=INFO source=routes.go:1297 msg="server config" env="map[HTTPS_PROXY: HTTP_PROXY: NO_PROXY: OLLAMA_CONTEXT_LENGTH:4096 OLLAMA_DEBUG:INFO OLLAMA_FLASH_ATTENTION:false OLLAMA_GPU_OVERHEAD:0 OLLAMA_HOST:http://127.0.0.1:11434 OLLAMA_KEEP_ALIVE:5m0s OLLAMA_KV_CACHE_TYPE: OLLAMA_LLM_LIBRARY: OLLAMA_LOAD_TIMEOUT:5m0s OLLAMA_MAX_LOADED_MODELS:0 OLLAMA_MAX_QUEUE:512 OLLAMA_MODELS:/Users/ega4432/.ollama/models OLLAMA_MULTIUSER_CACHE:false OLLAMA_NEW_ENGINE:false OLLAMA_NOHISTORY:false OLLAMA_NOPRUNE:false OLLAMA_NUM_PARALLEL:1 OLLAMA_ORIGINS:[http://localhost https://localhost http://localhost:* https://localhost:* http://127.0.0.1 https://127.0.0.1 http://127.0.0.1:* https://127.0.0.1:* http://0.0.0.0 https://0.0.0.0 http://0.0.0.0:* https://0.0.0.0:* app://* file://* tauri://* vscode-webview://* vscode-file://*]""
time=2025-08-15T10:31:03.105+09:00 level=INFO source=images.go:477 msg="total blobs: 0"
time=2025-08-15T10:31:03.105+09:00 level=INFO source=images.go:484 msg="total unused blobs removed: 0"
time=2025-08-15T10:31:03.107+09:00 level=INFO source=routes.go:1350 msg="Listening on 127.0.0.1:11434 (version 0.11.3)"
time=2025-08-15T10:31:03.165+09:00 level=INFO source=types.go:130 msg="inference compute" id=0 library=metal variant="" compute="" driver=0.0 name="" total="21.3 GiB" available="21.3 GiB"
[GIN] 2025/08/07 - 10:33:29 | 200 |    1.298417ms |       127.0.0.1 | HEAD     "/"
[GIN] 2025/08/07 - 10:33:29 | 404 |    1.708166ms |       127.0.0.1 | POST     "/api/show"
```

### gpt-oss モデルの取得

Ollama CLI を使って gpt-oss:20b モデルをダウンロードする。

```bash
$ ollama pull gpt-oss:20b
```

### インストール済みモデルの確認

以下のコマンドでインストール済みのモデル一覧を確認できる。

```sh
$ ollama list
NAME            ID              SIZE     MODIFIED
gpt-oss:20b     f2b8351c629c    13 GB    1 days ago
```

### モデルの起動と対話

以下のコマンドでモデルを起動し、対話を開始する。

正常に起動できると `>>> ` でユーザからの入力を待ち受ける。

この状態で使用できるコマンドがいくつか用意されており、`/` を先頭に付与することで実行できる。

コマンドについては `/?` がヘルプコマンドになっていて、どんなコマンドが利用可能かを確認できる。

```sh
$ ollama run gpt-oss:20b
>>> /?
Available Commands:
  /set            Set session variables
  /show           Show model information
  /load <model>   Load a session or model
  /save <model>   Save your current session
  /clear          Clear session context
  /bye            Exit
  /?, /help       Help for a command
  /? shortcuts    Help for keyboard shortcuts

Use """ to begin a multi-line message.

>>> ollama は何と読みますか？
Thinking...
The user asks in Japanese: "ollama は何と読みますか？" This likely refers to "Ollama"
which is a Japanese brand? Actually "ollama" is a Japanese word maybe meaning "to make a
ball"? Wait "ollama" maybe "ollama" is a misspelling of "Ollama" the AI tool from Ollama?
The user asks how to read "ollama" in Japanese? The user may refer to the open-source LLM
framework "Ollama" (like "Ollama" company name). How do you pronounce "ollama" in
Japanese? It might be read as "オラマ" (O-rama) or "オラマ" but the user might want
"ollama" reading. Usually "ollama" is pronounced "オラマ" in Japanese. But perhaps it's "オ
ラマ" or "オッラマ"? There's "ollama" as in "ollama" (like "Ollama" brand). But the
Japanese might read "オッラマ" if "ll" is pronounced as a single 'l' sound like 'ラ', but
with a double 'l'? In Japanese, 'll' would just be 'ラ'. So "ollama" would be "オラマ".
However, the user might be referring to "ollama" as a word in Spanish or some other
language. But in context, maybe they refer to "ollama" meaning "the company name" or
"Ollama" is^[ "ollama" is read as "オーラマ"? Actually "Ollama" maybe "Ollama" brand like
"Ollama", maybe "ollama" is "オッラマ" or "オラマ". Let's think: "ollama" the company
that produces "Ollama" (Ollama.com). How do you read it? It's brand name, but might be
read as "オラマ". But sometimes brand names are pronounced phonetically: "ollama" could
be "オッラマ" with double 'l', but in Japanese there is no "ll" sound, so they just use "ラ
". They might add a small "ー" after 'ラ' if lengthening: "オーラマ"? Actually "ll" would
be like 'ラ' or 'ラ' but could be 'ラ', not 'ー'. So "ollama" is read "オラマ". But maybe
they want "おっラマ"? Wait 'll' like 'll' in Spanish is a palatal 'j' sound, but that is
not relevant.
The user: "ollama は何と読みますか？" They ask in Japanese: "How is 'ollama' read?" The
answer: "オラマ". Provide explanation. Might add note that brand names might be read as "オ
ーラマ" or "オラマ" or "オッラマ"? The typical reading for 'llama' is "ラマ" but "ollama"
is 'オラマ' (o-ra-ma). But the "O" prefix may be "オー"? Actually "ollama" starts with
'o', so in Japanese "o" is 'オ', then 'llama' is 'ラマ', so "オラマ". Yes. Might also
note that the English 'llama' is a animal with 'LLA' but the brand might pronounce
differently. So answer: "オラマ" with romanization "orama". Or perhaps "オーラマ" if
elongated 'o'. But I think "オラマ" is correct.
Better answer: "ollama" (オラマ). It could also be read as "オッラマ"? But no.
Thus, I'll answer: "ollama は 'オラマ' と読みます。".
I can also explain: In Japanese, brand names that use the Latin alphabet are usually
transcribed phonetically: "ollama" → "オラマ". If they want to emphasize "ll" as a
double consonant, they might use "オッラマ", but that is not common. Provide both
possibilities. Also mention that the correct romanization is "orama". So answer in
Japanese.
Proceed.
...done thinking.
「ollama」は日本語では「オラマ」と読まれる。
※英語のスペルをカタカナにそのまま音写したものである。
（「オッラマ」と長音を強調した読み方を使うケースはほとんどない。）
>>> /bye
```

このように「ollama は何と読みますか？」と質問すると、内部で思考過程を展開してから答えを生成している様子が出力される。しばらくすると回答が出力された。

「オラマ」と発音するらしい。知らなかった笑

対話を終了する際は、`/bye` コマンドで終了できる。

下記はあくまで一部を切り取ったものであるが、`ollama serve` を実行しているターミナルを見ると、どのような処理を行っているか、どの API を叩いているかなどのログを確認できるため、興味がある方は見てみるとよい。

```
[GIN] 2025/08/16 - 11:36:45 | 200 | 12.957105833s |       127.0.0.1 | POST     "/api/generate"
[GIN] 2025/08/16 - 11:37:27 | 200 | 27.311659834s |       127.0.0.1 | POST     "/api/chat"
[GIN] 2025/08/16 - 11:40:44 | 200 |  2.533098708s |       127.0.0.1 | POST     "/api/chat"
[GIN] 2025/08/16 - 11:40:53 | 200 |     281.042µs |       127.0.0.1 | HEAD     "/"
[GIN] 2025/08/16 - 11:40:53 | 200 |   89.191375ms |       127.0.0.1 | POST     "/api/show"
```

## まとめ

本記事では、M1 MacBook Pro 上で Ollama を使い、gpt-oss をローカルで動かす方法を紹介した。ローカル LLM の利点や Ollama の使いやすさを体感でき、今後の開発や検証に役立つツールとして期待できる。

## 参考

https://openai.com/ja-JP/index/introducing-gpt-oss/

https://github.com/openai/gpt-oss

https://ollama.com

https://amzn.to/4luvdYK

https://amzn.to/4lrOuKF
