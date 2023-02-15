---
title: React + TypeScript でファイルアップロード機能を実装する
date: '2022-04-26'
tags: ['React', 'TypeScript', 'HTTP', 'API']
draft: false
summary: 実装する機会があったので簡単に手順をまとめておく
---

## はじめに

React + TypeScript なフロントエンドからファイルをアップロードする機能を実装する機会があったので、簡単に備忘録として残しておく。

前提としては、フロントエンドから REST 形式で配信されているファイルアップロード用の外部 API に対してリクエストを送るという形を想定している。

API の実装については深くは触れずにフロントエンドでは「こう実装してみた！」という内容を多めに書いていく。

## 実装方法の検討

[WebAPI でファイルをアップロードする方法アレコレ \- Qiita](https://qiita.com/mserizawa/items/7f1b9e5077fd3a9d336b)

API の実装方法については、こちらの記事を読んで今回は `multipart/form-data` で用意した。少し脱線するが、画像の話が出てくるだけで、通常の RESTful な API では考慮しないようなことがどんどん出てくるので非常に面白い。API を実装する際に考慮することのような話も今後書けるように勉強しておきたい。

本題に戻るが、フロントエンドから API をコールする際に `"Content-Type": "multipart/form-data"` を付与してあげれば良さそう。

API クライアントには慣れている axios を使用した。

## UI を作る

まず、こんな感じで適当にフォームを作ってファイルを選択できるような UI を作る。

```tsx:App.tsx showLineNumbers
export const App = (): JSX.Element => {
  return (
    <div className="App">
      <div className="App-form">
        <input name="file" type="file" accept="image/*" />
        <input type="button" disabled={!file} value="送信" />
      </div>
    </div>
  )
}
```

マークアップは雑だが、とりあえず下記のような見た目ができあがる。

![React UI](https://i.imgur.com/CyPZF4G.webp)

送信するファイルの拡張子を制限したい、あるいは緩和したい場合は、`accept="image/*"` の部分を変更すると良い。

## ファイルを保持できるようにする

ファイルを選択したら、そのデータをリクエストに含めたいので、ファイルを選択した際の処理を書いていく。

```tsx:App.tsx showLineNumbers {1,4-11,20}
import React, { useState } from "react"

export const App = (): JSX.Element => {
  const [file, setFile] = useState<File | null>(null)

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  return (
    <div className="App">
      <div className="App-form">
        <input
          name="file"
          type="file"
          accept="image/*"
          onChange={onChangeFile}
        />
        <input type="button" disabled={!file} value="送信" />
      </div>
    </div>
  )
}
```

- ファイルを選択する度に Change メソッドが呼ばれ、`onChangeFile` が発火する。
- 予め `useState` フックを使ってファイルのデータを `file` という state 変数に保持し、`onChangeFile` で `setFile` を呼び出し state を更新する。

## 送信ボタンを押下してリクエスト送信する

続いて送信ボタン押下した際の処理を書いていく。

```tsx:App.tsx showLineNumbers {2,14-29,40}
import React, { useState } from "react"
import axios, { AxiosError } from "axios"

export const App = (): JSX.Element => {
  const [file, setFile] = useState<File | null>(null)

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const onClickSubmit = async () => {
    if (!file) {
      return
    }
    const formData = new FormData()
    formData.append("file", file)

    await axios.post(`${apiUrl}/api/upload`, formData)
      .then((res) => {
        console.log(res.data)
      })
      .catch((e: AxiosError) => {
        console.error(e)
      })
    }
  }

  return (
    <div className="App">
      <div className="App-form">
        <input
          name="file"
          type="file"
          accept="image/*"
          onChange={onChangeFile}
        />
        <input type="button" disabled={!file} value="送信" onClick={onClickSubmit} />
      </div>
    </div>
  )
}
```

- 送信ボタンを押下すると `onClickSubmit` が発火。
- FormData オブジェクトを生成し、state 変数 `file` が存在すれば append でフィールドに追加する。
- axios で POST リクエストを送信する。その際、リクエスト Body に FormData を含めることで HTTP ヘッダに `"Content-Type"": multipart/form-data; boundary=----xxxx` が付与されているのが下記の画像からも分かる。

![Request ](https://i.imgur.com/G6QADPr.webp)

（エラーになっているのは localhost:5000 を起動していないだけなので無関係）

## まとめ

今回は、React + TypeScript でファイルのアップロード機能を実装してみた。おそらく API 側で受け取れるようになっているはず。

ファイルの扱い方にも触れることができて勉強となった。あとはファイル選択部分の UI をカスタマイズしてみたり、受け取る側の API を実装したりしてみたい。
