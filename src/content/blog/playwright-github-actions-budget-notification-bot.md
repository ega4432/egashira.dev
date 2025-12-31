---
title: "Playwright と GitHub Actions を活用したマネフォ家計簿自動通知 bot"
date: "2023-12-28"
tags:
  [
    "TypeScript",
    "Playwright",
    "GitHub Actions",
    "MoneyForward",
    "スクレイピング"
  ]
draft: false
summary: "表題の通り、家族みんなが定期的に通知を受け取ることができるようにする bot を作ってみた"
---

## はじめに

ここ 3 年くらい Money Forward ME で家計簿をつけている。つけていると言ってもクレジットカードや銀行口座、電子決済アプリを登録しておいて、それら登録しているそれらの手段で普段決済することで自動的にデータが収集されるように生活している（できる限り）。

Money Forward ME は 1 週間に一度現時点での口座の入出金履歴や資産情報をメールで通知してくれる、ウィークリーメールなる機能もあり便利だ。
一方で以下のような課題があり、今回のことにチャレンジしてみた。

- 1 週間の出金履歴が 5 件までしか見れず、全体を把握したい
- メールだと見逃すので毎日必ず見るアプリに通知させたい

## 作ったもの

![architecture](https://i.imgur.com/eIeZ53N.webp)

解説すると以下のような動きとなる。

- Playwright で headless chromium を起動して、Money Forward Me のサイトをスクレイピングする
- スクレイピングして得られたデータを LINE Notify API を使って通知する
- これら全体を GitHub Actions 上で動作させる

## 実装方法

そこまで凝ったことはしていないのでやっていることはシンプルだが、いくつかピックアップして紹介する。

### Playwright でログイン処理

ログイン画面は、サイトによって DOM 要素が異なるため、devtool を使って調べながら実装した。

```ts title="main.ts" showLineNumbers
const email = process.env.EMAIL as string;
const password = process.env.PASSWORD as string;

// メールアドレスを入力
await page.locator('input[type="email"]').fill(email);
const nextEmailEmail = page.locator('button[id="submitto"]');
await page.screenshot({ path: `images/screenshot1.png`, fullPage: true });
if (await nextBtnEmail.isVisible()) {
  await nextBtnEmail.click();
} else {
  throw new Error("Not found next button before password input.");
}

// パスワードを入力
await page.locator('input[type="password"]').fill(password);
await page.screenshot({ path: "images/screenshot2.png", fullPage: true });
const nextBtnPassword = page.locator('button[id="submitto"]');
if (await nextBtnPassword.isVisible()) {
  await nextBtnPassword.click();
} else {
  throw new Error("Not found next button before login.");
}
```

### Playwright で画面遷移を待機する

ログイン前後や画面遷移後のロードに時間がかかり、画面遷移中に DOM 要素を探しに行ったりすると見つからずエラーになるという問題に遭遇した。

その際に回避した方法としては `waitForLoadState` メソッドでロード状態が完了するの待機することができた。

```ts title="main.ts" showLineNumbers
// ボタンやリンククリック後
await page.waitForLoadState("networkidle"),
```

`waitForURL` メソッドでも似たようなことは実現できると思うが、あまりそれぞれの違いについて分かっておらず引き続き深掘りたいポイントではあるので、もし知見がある方がいたら教えて欲しいmm

### LINE にメッセージを送る

今回は一番手っ取り早くできそうだった LINE Notify API を使って通知させるようにした。API call については axios などは使う必要がないと判断して fetch で素朴に実装した。

LINE の API については詳しくないので他にもいいやり方があればぜひ教えていただけると嬉しい。

```ts title="main.ts" showLineNumbers
const lineNotifyApiToken = process.env.LINE_NOTIFY_API_TOKEN as string;

export const postMessage = async (message: string) => {
  const response = await fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lineNotifyApiToken}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ message }).toString()
  });

  const json = await response.json();
  return json;
};
```

## 今後の課題

### Money Forward Me へのログイン改善

今回の仕組みを実現するために二段階認証を外して検証した。

より高いセキュリティを担保するためには外したくはないので、以下のようなパスワードマネージャを使うと GitHub Actions 上でも二段階認証をパスすることは実現できそうかなとは思っている。

https://developer.1password.com/docs/ci-cd/github-actions/

https://github.com/1Password/load-secrets-action

### GitHub Actions 起動時間短縮

GitHub Actions の処理終了までだいたい 2 分ほどかかっている。

定義ファイル内で Playwright をインストールする step を作っているが、その処理を上手くキャッシュするなどして、短縮できないか画策としていてそれも残課題だ。

```yaml title="main.yaml" showLineNumbers
jobs:
  notify:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .tool-versions
      - name: Install Playwright
        run: pnpx playwright install # <-- here


      # 省略 ...
```

## まとめ

この記事では、Playwright で Money Forward Me のサイトをスクレイピングし、取得したデータを LINE Notify API を通じて通知する bot を作ったので紹介した。

全体のプロセスは GitHub Actions で実行されるようにしたのでコスト面も管理面も特に発生しないような仕組みが作れて満足している。

Playwright そのものや GitHub Actions 上などの CI で実行する際のプラクティスがまだまだ不足している認識なので使っていく内に勉強し、改善していけたらと思う。

この記事をご覧いただいた方のお金の管理方法の一つとして少しでも参考になれば幸いだ。

## 参考

https://playwright.dev/docs/ci-intro

https://future-architect.github.io/articles/20230828a/

https://qiita.com/yoshi_yast/items/04d52eda57bd4d58e208

[^1]: waitForNavigation - ref. https://playwright.dev/docs/api/class-frame#frame-wait-for-navigation
