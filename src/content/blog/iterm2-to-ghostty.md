---
title: "iTerm2 から Ghostty に乗り換えた"
date: "2026-01-10"
tags: ["Ghostty", "iTerm2", "terminal"]
draft: false
summary: "Ghostty にターミナルを乗り換えた際の設定手順と考えたことのメモ"
---

## はじめに

メインで使用するターミナルを Ghostty に乗り換えたので、設定手順や考えたこと、苦戦したことなどを残しておく。

Ghostty は、Hashicorp の創業者である [Mitchell Hashimoto さん](https://x.com/mitchellh) が作った OSS のターミナルエミュレータである。

https://ghostty.org/

https://github.com/ghostty-org/ghostty

まずは結論からということで、最終的なイメージは下記のようになった。

![Ghostty Sample](https://i.imgur.com/Tq0An8K.webp)

## インストール

私は macOS 端末では Homebrew 経由でインストールした。

```sh
$ brew install --cask ghostty
```

Ubuntu 端末も使うことがあるため、そちらでは下記コマンドでインストールした。

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/mkasberg/ghostty-ubuntu/HEAD/install.sh)"
```

いずれも公式ドキュメントで記載されている方法をとった。他のパッケージマネージャーでインストールしたい場合はこちらを参照すると良いと思う。

https://ghostty.org/docs/install/binary

## config ファイルの作成

Ghostty は、Zero config を謳ってはいる[^1]ものの、自分が快適に作業を行うためにいろいろと設定をカスタマイズしたくなる。カスタマイズをするには、`$XDG_CONFIG_HOME/ghostty/config`, `$HOME/.config/ghostty/config` のパスにファイルを配置する必要がある。また、同じ設定を両者に記載した場合は前者が評価される。

設定値についての解説は後ほどとして、先に私が作成した設定ファイルを先に貼り付けておく。

https://github.com/ega4432/dotfiles/blob/main/ghostty_config

```ini title="~/.config/ghostty/config" showLineNumbers
# General
cursor-style = bar
font-family = JetBrains Mono
font-feature = -dlig
font-feature = -calt
mouse-hide-while-typing = true
window-save-state = always

# macos settings
macos-titlebar-style = tabs
macos-titlebar-proxy-icon = hidden
macos-non-native-fullscreen = true

# quick terminal
quick-terminal-position = top
quick-terminal-screen = main
quick-terminal-animation-duration = 0.3
quick-terminal-autohide = true

# keybinds
keybind = global:ctrl+enter=toggle_quick_terminal
keybind = shift+enter=text:\n

# window settings
maximize = true
window-padding-balance = true
window-theme = ghostty
background-blur-radius = 20
background-opacity = 0.7
initial-window = false
quit-after-last-window-closed = false
```

## カスタマイズした内容

### Hotkey Window

iTerm2 では Hotkey Window といって設定したキーバインドでターミナルウィンドウを素早く表示/非表示できる機能があり、非常に便利だったため Ghostty でも同様の機能を実現したかった。

https://iterm2.com/documentation-hotkey.html

Ghostty では Quick Terminal という機能で同等のことが実現できる。現状 `ctrl` + `enter` キーで window が開くように設定している。

```ini showLineNumbers
# クイックターミナルを画面上部に表示
quick-terminal-position = top
# メインディスプレイに表示
quick-terminal-screen = main
# アニメーション速度(秒単位)
quick-terminal-animation-duration = 0.3
# フォーカスが外れたら自動的に非表示
quick-terminal-autohide = true
# 幅100%、高さ210pxで表示
quick-terminal-size = 100%,210px

# グローバルキーバインドで切り替え
keybind = global:ctrl+enter=toggle_quick_terminal

# 起動時にウィンドウを開かない
initial-window = false
# 最後のウィンドウを閉じてもアプリを終了しない
quit-after-last-window-closed = false
```

ただし、Quick Terminal にはいくつかの制約がある。全画面で広げることができず、画面上部のみ表示される点や、タブ機能が使えない点だ。そのため、複数のターミナルを同時に使いたい場合は、画面分割機能を活用している。私の場合は `cmd + d` で横の画面分割、`cmd + shift + d` で縦の画面分割で対応している。

前者については調べてみたところ GitHub discussion に起票があった。

https://github.com/ghostty-org/ghostty/discussions/7319

また補足として、私の Ubuntu(GNOME + Wayland)環境だと、仕様上、画面最前面に常駐するドロップダウンウィンドウを作れない（Quick Terminal のような機能も含めて）ため、Hotkey Window 相当の常駐表示を諦めた。これは Wayland のセキュリティモデルとウィンドウマネージャの制約によるもので、Ubuntu 以外の Linux ディストリビューションでも同様の制限がある。

下記のディスカッションで記載されていた。

https://github.com/ghostty-org/ghostty/discussions/3459

### 背景の透過

個人的にちょうど良さそうな透過度を設定した。背景を透過させた見た目が好きなのでこのように設定している。`background-blur-radius` を 0 にすることで、ぼかし効果をなくし、裏側の画面がうっすらと見えるようになる。

```ini showLineNumbers
# 背景の透過度(0.0-1.0)
background-opacity = 0.7
# 背景のぼかし効果(0でぼかしなし)
background-blur-radius = 0
```

### フォント

フォントは JetBrains Mono を使用している。また、`font-feature` で合字(リガチャ)を無効化している。`-dlig` は任意の合字、`-calt` は文脈に応じた代替文字を無効にする設定で、コードを書く際にそのままで表示させたいため設定している。

```ini showLineNumbers
# フォントファミリー
font-family = JetBrains Mono
# 任意の合字を無効化
font-feature = -dlig
# 文脈に応じた代替文字を無効化
font-feature = -calt
```

### その他細かい設定

上記以外にも、細かい設定をいくつか行っている。

```ini showLineNumbers
# カーソルスタイルをバー型に
cursor-style = bar
# タイピング中はマウスカーソルを非表示
mouse-hide-while-typing = true
# ウィンドウの状態を常に保存
window-save-state = always

# macOS固有の設定
# タイトルバーをタブスタイルに
macos-titlebar-style = tabs
# タイトルバーのプロキシアイコンを非表示
macos-titlebar-proxy-icon = hidden
# ネイティブでないフルスクリーンモードを使用
macos-non-native-fullscreen = true

# ウィンドウ設定
# 起動時にウィンドウを最大化
maximize = true
# ウィンドウのパディングをバランスよく配置
window-padding-balance = true
# ウィンドウテーマ
window-theme = ghostty

# キーバインド
# Shift+Enterで改行を入力
keybind = shift+enter=text:\n
```

## dotfiles に設定を追加

私は、mac, Linux の環境設定を dotfiles で管理しているので iTerm2 から Ghostty への変更も適用させておく。詳しくは GitHub にあげているので詳細は参照して欲しい。

https://github.com/ega4432/dotfiles/pull/36

1. Brewfile に追記
2. Ghostty の config ファイルを追加
3. dotfiles から `~/.config/ghostty/config` へシンボリックリンクを貼る

## まとめ

iTerm2 から Ghostty に乗り換えて、ターミナル環境を一通り乗り換えることができた。

iTerm2 と比較しても高速でストレスなく作業できている。設定ファイルがテキストベースで管理できるため、dotfiles で一元管理しやすい点も大きなメリットに感じている。
一方で、Quick Terminal が全画面表示できないなど、いくつかの発展途上感も否めない。今後のアップデートで改善されることに期待。

最後に余談になるが、X でバズっている[こちらの post](https://x.com/AlexFinn/status/2008364830114329012) をご覧になっただろうか。`you don't need to look at code anymore` はバズ目的の誇張表現だとは思うが、AI 搭載の IDE の今後と、ターミナルだけを使った開発の動向について気になるところなので、まずは流行っている Ghostty を日常的に使いつつその感触を肌で感じていけたらなと思う。

## 参考

https://amzn.to/4r6BzRF

https://amzn.to/45NDhii

https://engineering.konso.me/articles/iterm2-to-ghostty/

https://izanami.dev/post/36f2a88f-48d2-45b5-b0d7-a7dc32e68152

https://zenn.dev/koya_iwamura/articles/65e4fbb747bcd2

https://qiita.com/reoring/items/df6d02ed7d6800c4eebe

[^1]:
    > Ghostty is designed to work out of the box with no configuration for most users. Ghostty has sensible defaults, embeds a default font (JetBrains Mono), has built-in nerd fonts, and more. We are constantly challenging ourself as a project to eliminate any necessary configuration to use Ghostty. - ref. https://ghostty.org/docs/config#zero-configuration-philosophy
