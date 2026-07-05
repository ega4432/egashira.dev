# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`egashira.dev` は ega4432 個人のブログ／サイトを構築する Astro プロジェクトである。コンテンツ（ブログ記事）は主に Notion 上で執筆され、スケジュール実行される GitHub Action によって Markdown としてこのリポジトリにインポートされるが、`npm run new` によるローカルでの直接執筆も通常の運用手段の一つである。

## コマンド

- `npm run dev` — ローカル開発サーバーを起動する（Astro のデフォルトである `localhost:4321`。）
- `npm run build` — `astro check && tsc --noEmit && playwright install chromium && astro build` を実行する。これが正しさを担保する一連のチェックであり、変更が完了したとみなす前に必ず実行すること
- `npm run preview` — 本番ビルドをローカルでプレビューする
- `npm run eslint` / `npm run eslint:fix` — `./src` を対象に警告ゼロを条件として lint する
- `npm run prettier` / `npm run prettier:fix` — リポジトリ全体のフォーマットをチェック／修正する
- `npm run astro -- <cmd>` — 任意の Astro CLI コマンドを実行する（例: `astro check`）
- `npm run new` — `src/content/blog` 配下に新規ブログ記事の雛形を対話形式で作成する（title/date/tags/draft/summary/slug を入力）
- `npm run archive-images` — 最近編集された Notion ページ内の画像を取得し Imgur に再ホストする（`NOTION_API_KEY`、`NOTION_DATABASE_ID`、`IMGUR_*` の環境変数が必要）。`import` ワークフロー内でのみ意味を持つ

このリポジトリにはテストランナー／テストスイートは存在しない。正しさは `astro check`、`tsc --noEmit`、`eslint`、`prettier` によって担保されている。`playwright` はビルドステップ（`rehype-mermaid` が Mermaid 図を SVG にレンダリングする際に Chromium を起動するため）のために devDependency として入っているが、現状 Playwright のテストファイルは存在しない。`npm run build` の一部として `playwright install chromium` が実行されるため、通常は別途手動でのブラウザインストールは不要（`postinstall`／`preinstall` フックはサプライチェーン攻撃の踏み台になり得るため意図的に使用していない）。もし Chromium の起動に失敗すると、Astro のコンテンツローダーはそのエラーを警告ログとして記録するだけで処理を続行し、該当記事の本文が空のままビルドが「成功」してしまう点に注意（Mermaid 記法を含む記事の本文が丸ごと出力されない場合はまずこの Chromium 起動失敗を疑うこと）。

pre-commit フック（husky + lint-staged、`.lintstagedrc.js` 参照）はステージされたファイルに対して prettier、eslint、`astro check` を実行する。CI でも同様のチェックがゲートになると想定してよい。

## アーキテクチャ

### コンテンツパイプライン（Notion → Markdown → Astro）

1. `.github/workflows/import.yaml` はスケジュール実行（3時間ごと）および手動実行に対応している。`npm run archive-images`（`scripts/archive-images.mjs` により Notion の画像を Imgur に再ホスト）を呼んだ後、外部アクション `ega4432/notion-to-markdown-action` を使って Notion のページを `src/content/blog/*.md` にエクスポートし、フロントマターの `slug:` キーを削除し、`draft: true` のファイルを削除した上で、結果を自動コミット・プッシュする。
2. Astro のコンテンツコレクションは `src/content.config.ts` で定義されており、`src/content/blog` と `src/content/page` に対して `glob()` ローダーを使用し、`src/content/schemes.ts` の Zod スキーマ（`blogScheme`、`pageScheme`）でバリデーションされる。
3. `src/lib/blog.ts` は `blog` コレクションに対する読み取り用 API である。`getBlogs()`（下書きを除外し日付降順でソート）、`getTags()`（タグの出現数を集計。大文字小文字を無視して重複除去しつつ最初に出現した表記を保持）、`getRelatedBlogs()`（共通タグ数でスコアリングして関連記事を返す）。
4. ローカルで手動執筆する場合は `npm run new`（`scripts/new-post.ts`）を使う。これは `blogScheme` に合致するフロントマターのみのひな形を書き出す。

記事は通常機械的にインポートされるため、フロントマターの形（`title`、`date`、`tags`、`draft`、`summary`、任意の `createdAt`／`updatedAt`）は契約として扱うこと。`blogScheme` を変更する際は、インポートアクションが出力する内容との互換性を保つ必要がある。

### Markdown レンダリングパイプライン

`astro.config.mjs` 内でカスタムの `unified()` プロセッサとして設定されている（Astro のデフォルトの remark/rehype スタックではない）。

- remark: `remark-emoji`、`remark-math`、および独自プラグイン `src/lib/utils/remark-plugins/remark-link-card.ts`（単独行に置かれた裸の URL をリッチなリンクカードに変換する）
- rehype: `rehype-slug` → `rehype-autolink-headings`（`src/lib/utils/rehype-plugins/rehype-auto-link-headings.ts` の独自アンカーアイコンを使用）→ `rehype-katex` → `rehype-mermaid`（SVG 画像としてレンダリング、ダークテーマ用の設定を別途持つ）→ `rehype-pretty-code`（Shiki、`github-dark-default` テーマ、diff 記法の transformer 付き）

リンクカードはビルド時に Open Graph データを取得し、`src/lib/ogCache.ts`（`getOgData`/`setOgData`）を介して `public/og-cache.json` に結果をキャッシュする。これにより、変更のない URL をビルドのたびに再スクレイピングすることを避けている。

### OG 画像生成

`src/integrations/generateOgImages.ts` は `astro:build:done` フックを使う独自の Astro インテグレーションである。ビルドされた `blog/*` ページごとに、元の Markdown フロントマターから記事タイトルを（`gray-matter` 経由で）読み取り、`satori` で 1200×630 の画像をレンダリングし（`src/integrations/assets/background.png` と `NotoSansJP-Bold.otf` を使用）、`sharp` で PNG にラスタライズして `dist/images/<page>/og.png` に書き出す。

### サイトメタ情報

サイト全体で使う定数（著者名、URL、説明文、フッターリンク、SNS アカウント、ページサイズなど）はすべて `src/constants.ts`（`siteMeta`、`footerLinks`、`DEFAULT_PAGE_SIZE`）に集約されている。サイトメタ情報を他の場所にハードコードするより、このファイルを編集することを優先すること。`SEO.astro` や `BlogHead.astro` などのコンポーネントはこの形に依存している。

### パスエイリアス

TypeScript のパスエイリアス（`tsconfig.json` 参照）。相対パスの `../../` の代わりにこちらを使うこと。

`@components/*`、`@layouts/*`、`@pages/*`、`@lib/*`、`@content/*`、`@styles/*`、`@integrations/*`、`@constants`（`/*` なしで `src/constants.ts` 自体を指す）、`@scripts/*`

### デプロイ

サイトは Cloudflare Pages 上にデプロイされている。`astro.config.mjs` は `CF_PAGES_BRANCH`／`CF_PAGES_URL` の環境変数に応じて `site` の URL を切り替える（`main` ブランチでは本番 URL、それ以外ではプレビュー URL、どちらもない場合は localhost）。

### その他の生成／特殊ルート

- `src/pages/feed.xml.js` — RSS フィード
- `src/pages/llms.txt.ts` — サイト全体と公開済み全記事の概要をプレーンテキストで出力する（LLM 向け）
- `src/pages/tags/` — `getTags()` を利用したタグ一覧・タグ別記事一覧ページ
