const me = "ega4432";

interface Link {
  href: string;
  title: string;
}

interface SiteMeta {
  title: string;
  author: string;
  description: string;
  language: "ja-jp";
  theme: "system" | "dark" | "light";
  siteUrl: string;
  siteRepo: string;
  siteLogo: string; // TODO: '/static/images/logo.png',
  image: string; // TODO: '/static/images/avatar-ega.png',
  socialBanner: string;
  email: string;
  github: string;
  twitter: string;
  twitterUserId: string;
  zenn: string;
  locale: "ja-JP";
}

export const footerLinks: Link[] = [
  { href: "/", title: "ホーム" },
  { href: "/about", title: "このサイトについて" },
  { href: "/privacy", title: "プライバシーポリシー" },
  { href: "/feed.xml", title: "フィード" },
  { href: "/sitemap-index.xml", title: "サイトマップ" },
  { href: `https://github.com/${me}`, title: "GitHub" },
  { href: `https://twitter.com/${me}`, title: "Twitter" }
];

export const siteMeta: SiteMeta = {
  title: "egashira.dev",
  author: me,
  description: "外資系企業で働く防衛大卒のソフトウェアエンジニア",
  language: "ja-jp",
  theme: "system", // system, dark or light
  siteUrl: "https://egashira.dev",
  siteRepo: `https://github.com/${me}/egashira.dev`,
  siteLogo: "", // TODO: '/static/images/logo.png',
  image: "/images/avatar-ega.png",
  socialBanner: "/images/undraw.png", // TODO: '/static/images/twitter-card.png',
  email: "hello@egashira.dev",
  github: `https://github.com/${me}`,
  twitter: `https://twitter.com/${me}`,
  twitterUserId: "1220570588885868544",
  zenn: "https://zenn.dev/ysmtegsr",
  locale: "ja-JP"
};

export const DEFAULT_PAGE_SIZE = 10;
