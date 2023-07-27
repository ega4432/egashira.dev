---
title: 書籍「入門 モダンLinux」を読んだ
date: "2023-07-25"
tags: ["book", "Linux", "O'reilly"]
draft: false
summary: 読んだ感想など自分なりのまとめ
completeDate: "2023-07-23"
---

## はじめに

書籍「入門 モダンLinux」を読んだので自分なりのまとめや感想などを書いておく。

https://www.oreilly.co.jp/books/9784814400218/

## 感想

本書を読んだきっかけとしては、コンテナ実行基盤としての Linux をもっと深く知りたいというモチベーションから手に取ってみた。僕は、新卒 1, 2 年目からコンテナを使う時代にエンジニアになったのだが、その仕組をろくに学ばずにあまりにも当たり前のようにコンテナを使っていた。

例えば、コンテナはホストの Linux カーネルとプロセスを共有し、コンテナごとに独立した隔離空間を実現している。それは何となく分かってはいるが、隔離空間と言っても具体的にどんな機能を使っているのかを掘り下げてみたい人などにはオススメできるのではないだろうか。

また、まずは Linux の概要的なところをざっくり体系的に学ぶという意味でも本書はいいチョイスになるのでは無いかと思った。

## 本書の要約

### 2章 Linux カーネル

- Linux の中核であるカーネルの話。ディストリビューションや環境に関わらず大まかな機能や構成は同じなのでざっくりでいいので知っておくと良いと思った。
- Linux カーネルを拡張したい際やカーネル内で実行可能なタスクを実装した場合に利用する eBPF についても触れられている。
  - k8s クラスタ内のコンテナ間通信で活用されていることも最近注目されている技術らしい。
  - eBPF については名前くらいしか知らなかったので、とりあえずこの辺を読んでキャッチアップした。
    - [eBPFに3日で入門した話 \- CADDi Tech Blog](https://caddi.tech/archives/3880)
    - [eBPF \- 入門概要 編](https://zenn.dev/hidenori3/articles/e1352e8cfeb2af)

### 3 章 シェルとスクリプト

- 普段からシェル芸をよくやるせいか知っている内容が多めだった。
- モダンなコマンドとしては以下が紹介されていた。この辺は割りと普段から使っている。
  - `ls` の代替 `exa`
  - `cat` の代替 `bat`
  - `find` + `grep` の代替 `rg`
  - JSON 専用の整形コマンド `jq`
- 広くデフォルトとして普及している `bash` に代わるモダンシェルとして`fish` , `zsh` が紹介されていた。
- シェルスクリプトの Good Practice
  - `chmod +x` よりも `chmod 750` の方が望ましい。
  - `set -o errexit`, `set -o pipefail` で速やかに失敗し終了する。
    - 僕はよく `set -eux` としているので `pipefail` も入れるようにしようと思った。
  - 機密情報をスクリプトにハードコードしない
  - 入力のサニタイズと必要に応じて `read` コマンド経由で対話的にパラメータを受け取る
  - スクリプト内で前提となるコマンドなど依存関係は確認する
  - その他にも、エラー処理は分かりやすくメッセージを返す、ドキュメンテーション、Git 管理する、テストするなどその他のプログラミングと同様に気をつける点について述べられていた。
  - `shellcheck` による静的解析と `shfmt` による自動修正、`bats` によるテスト
    - [ShellCheck – shell script analysis tool](https://www.shellcheck.net/)
    - [mvdan/sh: A shell parser, formatter, and interpreter with bash support; includes shfmt](https://github.com/mvdan/sh)
    - [bats\-core/bats\-core: Bash Automated Testing System](https://github.com/bats-core/bats-core)

### 4 章 アクセス制御

- ユーザ管理やパーミッションについて
- 高度な権限管理として、root が持つ絶対的な権限のうち必要なものだけを付与するケーパビリティや、システムコールを制限する **seccomp** や **ACL** について触れられていた。
- アクセス制御のいい実践方法としては以下が述べられていた。
  - 最小権限の原則
  - setuid を避けてケーパビリティを活用する
  - 監査ログを残す。読み取り専用にして改ざんを防ぐ。

### 5 章　ファイルシステム

- 仮想ファイルシステム、擬似ファイルシステム、通常のファイルについてまとめられていた。
- **FHS(Filesystem Hierarchy Standard)** を定義して Linux のトップレベルのディレクトリを標準化している。

### 6 章 アプリケーション、パッケージ管理、コンテナ

- 起動プロセスの流れ
  - UEFI/BIOS → ブートローダ → カーネル → init → 他のユーザ空間
- init システムとしてデファクトとなっている **systemd**
- コンテナの仕組みの説明
  - 今ではローカルのテストと開発から本番環境での分散システムと幅広く使われているが、コンテナは Linux カーネルが提供する namespace , cgroup などの基本的な機能を使って実行している。
  - **namespace**: プロセスごとにファイルシステム、ネットワーク、ユーザなど見え方を変更する機能。カーネル内で分離するわけではなく、あくまでも見え方を変えるだけ。
  - **cgroup**: リソースの使用を制限するもの。プロセスのグループに適用するもので階層構造になっている。
  - **cgroup v2**: v1 の設計とは異なり、1 つの階層で全てのコントローラは同じ方法で管理されている。
  - コンテナ関連ツールとしては Docker 以外にも buildah, podman, containerd, skopeo, nsenter, systemd-cgtop, unshare, lsns, cinf などコンテナエンジンからコンテナ関連のツールなど多くが紹介されていた。
    - [Buildah \| buildah\.io](https://buildah.io/)
    - [Podman](https://podman.io/)
    - [containerd – An industry\-standard container runtime with an emphasis on simplicity, robustness and portability](https://containerd.io/)
    - [containers/skopeo: Work with remote images registries \- retrieving information, images, signing content](https://github.com/containers/skopeo)

### 7 章 ネットワーク

- TCP/IP スタックや DNS について詳しく触れられている。
- また、高度なトピックとして以下が紹介されていた。
  - `whois` , `dhcpdump` , `ntpq` などのコマンド
  - ネットワークトラフィックを解析するためのツールとして `tshark` , `wireshark` , `tcpdump` などのコマンドや、`socat` , `geoiplookup` などのツール

### 8 章 オブザーバビリティ（可観測性）

- オブザーバビリティのトピックとしては、主にログとメトリクスが言及されていた。
  - ログでは古いログファイルを安価で低速なストレージにアーカイブすることで、ディスク容量の節約、高速な検索を実現するため**ログローテーション**を行ったり、カーネルからデーモン、ユーザ空間までさまざまなソースのための標準的なロギング機能である **Syslog**、systemd の一部でバイナリ形式でログを保存する **journalctl** の紹介がされていた。
  - 監視では、システムメトリクス、I/O デバイスとネットワークインターフェース、統合パフォーマンス監視などシステムの状況を把握するためのさまざまな手法が書かれていた。
- 高度なオブザーバビリティとしては、Prometheus と Grafana を組み合わせたメトリクス取得についても触れられていた。
- [Linux Performance](https://www.brendangregg.com/linuxperf.html)

### 9 章 高度なトピック

結構マニアックな内容が盛り込まれていて、例えば、AWS のサーバーレスコンピューティングのための仮想化機能 firecracker やセキュリティに関するトピックとして Kerberos, PAM などが挙げられていた。この章は知らない言葉多く出てきて、ひとつひとつ深掘れていないが、一旦脳内にインデックスを張っておき必要になったら勉強したいと思う。

- [サーバーレスコンピューティングのための軽量な仮想化機能](https://aws.amazon.com/jp/blogs/news/firecracker-lightweight-virtualization-for-serverless-computing/)
- [ケルベロス認証（Kerberos Authentication）とは](https://www.infraexpert.com/study/security18.html)
- [PAM（特権アクセス管理）とは？｜Safeguard – ジュピターテクノロジー株式会社](https://www.jtc-i.co.jp/product/sps/pam.html)
- [Nix & NixOS \| Reproducible builds and deployments](https://nixos.org/)

## 参考

https://www.oreilly.co.jp/books/9784814400218/
