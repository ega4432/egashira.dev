---
title: "Next.js で Basic 認証をやってみた"
date: "2023-08-20"
tags: ["Next.js", "TypeScript", "Node"]
draft: false
summary: "Next.js で個人プロジェクトを開発していて一旦雑に Basic 認証をかけたかったのでやってみた。"
---

## はじめに

Next.js で個人プロジェクトを開発していて一旦雑に Basic 認証をかけたかったのでやってみた。このポストはその際のメモ。

使っているもののバージョンとしては以下である。

- Next.js v13.4.16
- TypeScript v5.1.6

## やり方

まずは結論から。

超絶簡単だが、プロジェクトルートに `middleware.ts` を作成して以下のようにするだけでお k。

```ts:middleware.ts showLineNumbers
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/admin']
};

export default function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, password] = atob(authValue).split(':');

    if (user === process.env.USERNAME && password === process.env.PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Unauthorized.', {
    status: 401,
    headers: {
      'WWW-authenticate': 'Basic realm="Secure Area"'
    }
  });
}
```

いくつかポイントがあるので記載する。

### ファイルの場所

ミドルウェアのファイルは、以下のサイトに書かれているようにプロジェクトのルートに置く必要がある。

https://nextjs.org/docs/messages/nested-middleware

```bash {4}
$ tree -L 1 .
.
├── app
├── middleware.ts   # <-- here
├── next-env.d.ts
├── next.config.js
├── node_modules
├── package-lock.json
├── package.json
├── public
└── tsconfig.json
```

### Matcher

このミドルウェアを適用させるパスを記載する。

- `/` から始める必要がある。
- `/about/:path` とすると、`/about/a` , `/about/b` には適用されるが、`/about/a/nested` には適用されない。
  - `/about` 配下全てに適用させたかったら、`/about/:path*` とすればいい。
- アプリケーション全体に認証をかけたかったら `/` とすればいい。

### `new NextResponse`

Header に Authorization がなかったり、Basic 認証のユーザ名、パスワードが間違っていれば、`new NextResponse` でレスポンスを生成して返す。これは Next.js v13.1 から `rewrite` や `redirect` を使わずに実現できる。

### ユーザ名、パスワードを指定

`process.env.USERNAME` , `process.env.PASSWORD` としている箇所についてはローカルで確認する際には .env.local に記載しておけば大丈夫。

```txt:.env.local showLineNumbers
USERNAME=user
PASSWORD=pass
```

Vercel にデプロイする際は Vercel 上の環境変数に設定しておけば良い。

## まとめ

個人プロジェクトで Next.js を採用して開発している際に Basic 認証で済ませたいことがあったのでやってみた。外部の認証サービスを使うことが多いが、個人で開発したり、とりあえずで済ませたい場合は意外と使いそうだなと思ったのでまとめてみた。

## 参考

https://nextjs.org/docs/pages/building-your-application/routing/middleware#producing-a-response

https://nextjs.org/docs/messages/nested-middleware
