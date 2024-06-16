---
title: "OpenAI API を TypeScript で叩いてみた"
date: "2024-01-10"
tags: ["TypeScript", "Node.js", "OpenAI", "ChatGPT"]
draft: false
summary: "公式の Node.js/TypeScript ライブラリを使ってみた"
---

## はじめに

表題の通り試しに触ってみたが、検索して出てきた記事では書き方が古いものが多かったので現時点での実装を書いておく。

使用したのは以下のライブラリで、バージョンは v4.24.2 を使用した。

https://github.com/openai/openai-node

v3 から v4 へのマイグレーションガイドはこちら。メソッド自体やその使い方に変更があるので、新しいバージョンを利用する場合はこちらを参照すればいいと思う。

https://github.com/openai/openai-node/discussions/217

## サンプルコード

```ts:main.ts showLineNumbers
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      // prompt: "TypeScript で Hello World を書いてください。"
      messages: [
        {
          role: 'user',
          content: 'TypeScript で Hello World を書いてください。'
        }
      ]
    });

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0].delta?.content || '');
    }
  } catch (error) {
    throw new Error(error as string);
  }
}

main().catch((e) => console.error(e));
```

上記のコードを保存して実行すると以下のような結果が得られる。
パラメータの `model` は好きなものを選ぶと良い。[^1]

```sh
$ ts-node ./src/main.ts

以下は、TypeScriptでHello Worldを表示するサンプルコードです。

\`\`\`
const message: string = "Hello, World!";
console.log(message);
\`\`\`

これを、`.ts`拡張子のファイルに保存し、TypeScriptコンパイラでコンパイルした後、JavaScriptファイルとして実行すると、"Hello, World!"というメッセージが表示されます。%
```

もし 429 エラーとなる場合は、支払い方法などを設定できていない可能性があるので、事前に設定してから API キーを発行しておく必要がある。参考にした記事をいくつか貼っておく。

https://help.openai.com/en/articles/6891831-error-code-429-you-exceeded-your-current-quota-please-check-your-plan-and-billing-details

https://qiita.com/kotattsu3/items/d6533adc785ee8509e2c

https://zenn.dev/masaki_mori72/scraps/3ad2a70353e9b8

[^1]: モデル毎に金額も変わってくるので注意 - ref. [Pricing](https://openai.com/pricing)
