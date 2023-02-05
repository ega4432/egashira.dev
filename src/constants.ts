const me = "ega4432";

type Link = {
	href: string;
	title: string;
};

export const footerLinks: Link[] = [
	{ href: `https://github.com/${me}`, title: "GitHub" },
	{ href: `https://twitter.com/${me}`, title: "Twitter" },
	{ href: "/privacy-policy", title: "Privacy Policy" },
	{ href: "/feed.xml", title: "Feed" },
	{ href: "/sitemap.xml", title: "Sitemap" }
];

export const headerLinks: Link[] = [
	{ href: "/about", title: "About" },
	{ href: "/blog", title: "Blog" },
	{ href: "/tags", title: "Tags" },
	{ href: "/notes", title: "Notes" }
];
