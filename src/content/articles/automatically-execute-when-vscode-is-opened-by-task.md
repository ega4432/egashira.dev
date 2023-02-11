---
title: VSCode のタスクを使ってエディタを開くと同時に開発サーバを自動で起動する
date: "2022-07-30"
tags: ["VSCode", "Productivity", "Update"]
draft: false
summary: 毎回やる作業を VSCode のタスクを使って自動化してみたので紹介する
---

## はじめに

このブログの更新あるいは開発をする際、毎回以下の手順を行っている。

1. VSCode でこのブログのプロジェクトを開く
2. ターミナル or VSCode のターミナルで `npm run start` を実行する
3. 目的としていることをやり始める
   - 記事を書き始める
   - 機能実装する
   - バグを改修する

「2」については毎回必ず実行する必要があるので、自動化できないかと考えていたところ VSCode の機能であるタスクで実現できそうだと思ったのでやってみた。

## タスクとは

公式から以下のような説明がある。

> Tasks in VS Code can be configured to run scripts and start processes so that many of these existing tools can be used from within VS Code without having to enter a command line or write new code. Workspace or folder specific tasks are configured from the tasks.json file in the .vscode folder for a workspace. - ref. [Tasks in Visual Studio Code](https://code.visualstudio.com/docs/editor/tasks)

簡単に解説すると、スクリプトやコマンド実行といったものを VSCode で設定しておけば改めて入力することなく、VSCode 内で使用できるというものだ。その設定ファイルは `.vscode/tasks.json` に置く必要がある。

npm のシステムに対応していて package.json がある場合は package.json 内の npm-scripts を自動で検出できるようにもなっている。他にも Gulp や Grunt, Jake などのコマンドをサポートしているようだ。

## 結論

タスクとはどんなものか分かったところで最初に結論を書く。

こんな感じの JSON ファイルを用意し VSCode でプロジェクトを開くと、自動で開発サーバを起動してくれるようになる。

```json:.vscode/tasks.json showLineNumber
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "start",
      "problemMatcher": [],
      "label": "npm: start",
      "runOptions": {
        "runOn": "folderOpen"
      },
      "dependsOn": ["npm: install"]
    },
    {
      "type": "npm",
      "script": "install",
      "group": "none",
      "problemMatcher": [],
      "label": "npm: install",
      "detail": "install dependencies from package"
    }
  ]
}
```

## 手順

### タスクを設定する

VSCode でコマンドパレットを開き（mac だと ⌘ + Shift + P で開く）、`task` と入力すると `Tasks: Configure Task` と表示されるので Enter を押す。

![VSCode command](https://i.imgur.com/qNoHFVU.webp)

このブログプロジェクトのような npm で管理されているプロジェクトだと、自動で package.json 内のスクリプトが表示される。任意のものを選び Enter。

すると以下のようなファイルが作成される。

```JSON:.vscode/tasks.json showLineNumber
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "start",
      "problemMatcher": [],
      "label": "npm: start"
    }
  ]
}
```

### プロジェクトを開いたときにコマンドを実行する

上記で設定したタスクをプロジェクトを開いた際実行されるようにしたい。

その場合 `runOptions` プロパティの `runOn` を使って、動作のタイミングをカスタマイズできる。今回は開いたときに実行させたいので `folderOpen` を指定すると良い。

```JSON:.vscode/tasks.json showLineNumber {8-10}
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "start",
      "problemMatcher": [],
      "label": "npm: start",
      "runOptions": {
        "runOn": "folderOpen"
      }
    }
  ]
}
```

コマンドパレットより、`Tasks: Run Task` として 1 回実行すると下記のように右下に「今後開いた際に自動で実行することを許可するか」を尋ねられるので、「許可して実行」をクリックする。

![Allow an automatically task](https://i.imgur.com/LeQiTVr.webp)

このタイミングで一旦 VSCode を閉じて、再度開いた際にタスクが実行されるか確認すると期待道理動作した。

### 複数コマンドを実行する

冪等性を考えたときに、git clone したての場合など node_modules が存在しないことがある。それも考慮して事前にパッケージのインストールをするタスクも入れておきたい。

この場合、パッケージのインストールをしたあとにサーバを起動するという順番なのでタスク間の依存関係も定義する必要がある。

```json:.vscode/tasks.json showLineNumber {12, 14-21}
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "start",
      "problemMatcher": [],
      "label": "npm: start",
      "runOptions": {
        "runOn": "folderOpen"
      },
      "dependsOn": ["npm: install"]
    },
    {
      "type": "npm",
      "script": "install",
      "group": "none",
      "problemMatcher": [],
      "label": "npm: install",
      "detail": "install dependencies from package"
    }
  ]
}
```

## まとめ

今回は VSCode で自動で開発を立てるタスクを作成してみた！

このような仕組みを使って、開発やブログを書くハードルを少しでも下げて行けたらなと思う。またこんな感じで生産性を上げる方法について日々いろんなことにチャレンジしているので良かったら参考にしてもらえたら幸いだ。

## 参考

https://code.visualstudio.com/docs/editor/tasks
