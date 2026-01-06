/**
 * サイト設定定数
 *
 * このファイルには、サイト全体で使用される定数が定義されています。
 * 個人情報やサイト固有の設定を変更する場合は、このファイルを編集してください。
 */

// ============================================================================
// 基本設定
// ============================================================================

/**
 * サイト所有者のユーザー名
 * GitHub、Xなどのソーシャルメディアで使用されます
 */
const SITE_AUTHOR_USERNAME = "ega4432" as const;

/**
 * サイトのベースURL
 * OGP画像やRSSフィードなどで使用されます
 */
const SITE_BASE_URL = "https://egashira.dev" as const;

/**
 * サイトのタイトル
 */
const SITE_TITLE = "egashira.dev" as const;

/**
 * サイトの説明文
 * メタタグやOGPで使用されます
 */
const SITE_DESCRIPTION =
  "外資系企業で働く防衛大卒のプリセールスエンジニア" as const;

/**
 * 連絡先メールアドレス
 */
const SITE_EMAIL = "hello@egashira.dev" as const;

/**
 * XのユーザーID
 * Twitter Card用のメタタグで使用されます
 */
const TWITTER_USER_ID = "1220570588885868544" as const;

/**
 * ZennのプロフィールURL
 */
const ZENN_PROFILE_URL = "https://zenn.dev/ysmtegsr" as const;

// ============================================================================
// 型定義
// ============================================================================

/**
 * リンク情報の型定義
 */
interface Link {
  readonly href: string;
  readonly title: string;
}

/**
 * サイトメタ情報の型定義
 */
interface SiteMeta {
  readonly title: string;
  readonly author: string;
  readonly description: string;
  readonly language: "ja-jp";
  readonly theme: "system" | "dark" | "light";
  readonly siteUrl: string;
  readonly siteRepo: string;
  readonly siteLogo: string;
  readonly image: string;
  readonly socialBanner: string;
  readonly email: string;
  readonly github: string;
  readonly twitter: string;
  readonly twitterUserId: string;
  readonly zenn: string;
  readonly locale: "ja-JP";
}

// ============================================================================
// エクスポート定数
// ============================================================================

/**
 * フッターに表示するリンクのリスト
 *
 * 各リンクは以下の形式で定義します：
 * - href: リンク先のURL（内部リンクは相対パス、外部リンクは絶対パス）
 * - title: リンクのテキスト
 */
export const footerLinks: readonly Link[] = [
  { href: "/", title: "ホーム" },
  { href: "/about", title: "このサイトについて" },
  { href: "/privacy", title: "プライバシーポリシー" },
  { href: "/feed.xml", title: "フィード" },
  { href: "/sitemap-index.xml", title: "サイトマップ" },
  { href: `https://github.com/${SITE_AUTHOR_USERNAME}`, title: "GitHub" },
  { href: `https://x.com/${SITE_AUTHOR_USERNAME}`, title: "X" }
  // 将来的に追加する可能性のあるリンク：
  // { href: `https://bsky.app/profile/${SITE_AUTHOR_USERNAME}.bsky.social`, title: "Bluesky" }
] as const;

/**
 * サイトのメタ情報
 *
 * SEO、OGP、RSS、その他のメタデータで使用されます。
 * 変更する場合は、関連するコンポーネント（SEO.astro、BlogHead.astroなど）への
 * 影響を確認してください。
 */
export const siteMeta: Readonly<SiteMeta> = {
  title: SITE_TITLE,
  author: SITE_AUTHOR_USERNAME,
  description: SITE_DESCRIPTION,
  language: "ja-jp",
  theme: "system", // "system" | "dark" | "light"
  siteUrl: SITE_BASE_URL,
  siteRepo: `https://github.com/${SITE_AUTHOR_USERNAME}/egashira.dev`,
  siteLogo: "", // 将来的に追加予定: '/static/images/logo.png'
  image: "/images/avatar-ega.png",
  socialBanner: "/images/undraw.png", // 将来的に変更予定: '/static/images/twitter-card.png'
  email: SITE_EMAIL,
  github: `https://github.com/${SITE_AUTHOR_USERNAME}`,
  twitter: `https://x.com/${SITE_AUTHOR_USERNAME}`,
  twitterUserId: TWITTER_USER_ID,
  zenn: ZENN_PROFILE_URL,
  locale: "ja-JP"
} as const;

/**
 * ブログ記事一覧のデフォルトページサイズ
 *
 * 1ページあたりに表示する記事の数を定義します。
 * この値を変更すると、ページネーションの動作に影響します。
 */
export const DEFAULT_PAGE_SIZE = 10 as const;
