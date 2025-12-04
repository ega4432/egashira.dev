import type { Parent } from "unist";
import { visit } from "unist-util-visit";
import { encode } from "html-entities";
import ogs from "open-graph-scraper";
import type { Plugin } from "unified";
import type { Html, Link, Text, Root } from "mdast";
import type { ImageObject } from "open-graph-scraper/types";

import amazon from "../../../../public/amazon.json";
import { getOgData, setOgData, type LinkCardData } from "../../ogCache";

const OWN_DOMAIN = "egashira.dev";
const amazonMeta = {
  URL: "https://amzn.to",
  FAVICON_URL: "https://i.imgur.com/pHkePZN.png",
  DISPLAY_URL: "amazon.co.jp"
};
const faviconApiUrl = "https://www.google.com/s2/favicons?domain=";
const ignoreHosts = ["hub.docker.com", "ffmpeg.org"];
const affiliateLinks = ["click.linksynergy.com"];

const formatOgImageUrl = (
  ogImage: string | ImageObject | ImageObject[],
  url: string
) => {
  if (typeof ogImage === "string") {
    return ogImage.startsWith("/") ? `${url}${ogImage}` : ogImage;
  }

  if (Array.isArray(ogImage)) {
    return ogImage[0].url.startsWith("/")
      ? `${url}${ogImage[0].url}`
      : ogImage[0].url;
  }

  return ogImage.url.startsWith("/") ? `${url}${ogImage.url}` : ogImage.url;
};

const fetchOpenGraph = async (url: string): Promise<LinkCardData> => {
  const cachedData = (await getOgData(url)) as LinkCardData | null;
  if (cachedData) return cachedData;

  let parsedUrl = new URL(url);
  const defaultOgObject: LinkCardData = {
    title: parsedUrl.href,
    description: "",
    faviconSrc: `${faviconApiUrl}${parsedUrl.hostname}`,
    ogImageSrc: "",
    displayUrl: decodeURI(parsedUrl.hostname),
    url
  };

  const isAffiliateLink = affiliateLinks.includes(parsedUrl.hostname);
  const murlParam = isAffiliateLink ? parsedUrl.searchParams.get("murl") : null;
  const targetUrl = murlParam || url;

  if (ignoreHosts.includes(parsedUrl.hostname)) {
    return defaultOgObject;
  }

  try {
    const data = await ogs({
      url: targetUrl,
      timeout: 10000
    });
    if (data.error) {
      return defaultOgObject;
    }
    const { result } = data;
    if (result.requestUrl) {
      parsedUrl = new URL(result.requestUrl);
    }
    const title = (result.ogTitle && encode(result.ogTitle)) || parsedUrl.href;
    const description =
      (result.ogDescription && encode(result.ogDescription)) || "";
    const faviconSrc =
      isAffiliateLink && murlParam
        ? `${faviconApiUrl}${murlParam}`
        : `${faviconApiUrl}${parsedUrl.hostname}`;
    const ogImageSrc = result.ogImage
      ? formatOgImageUrl(result.ogImage, parsedUrl.origin)
      : "";
    const displayUrl =
      isAffiliateLink && murlParam
        ? decodeURI(new URL(murlParam).hostname)
        : decodeURI(parsedUrl.hostname);
    const finalData = {
      title,
      description,
      faviconSrc,
      ogImageSrc,
      displayUrl,
      url
    };
    await setOgData(url, finalData);
    return finalData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log("failed to fetch og data: ", e.result.requestUrl);
    return defaultOgObject;
  }
};

const isExternal = (url: string) => !url.includes(OWN_DOMAIN);

const createLinkCard = (
  data: LinkCardData,
  targetUrl: string,
  isAmazonUrl: boolean
): Html => {
  const { title, description, displayUrl, faviconSrc, ogImageSrc } = data;
  const props = {
    title,
    description: description || undefined,
    displayUrl,
    faviconSrc: faviconSrc || undefined,
    ogImageSrc: ogImageSrc || undefined,
    href: targetUrl,
    isExternal: isExternal(targetUrl),
    isAmazon: isAmazonUrl
  };

  const serializedProps = Object.entries(props)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        ` ${key}={${typeof value === "string" ? `"${value}"` : value}}`
    )
    .join("");

  const value = `<LinkCard${serializedProps} />`;
  return { type: "html", value };
};

const isSameUrl = (a: string, b: string) => {
  try {
    return new URL(a).toString() === new URL(b).toString();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};

const remarkLinkCard: Plugin<[undefined], Root> = () => async (tree) => {
  const transformers: (() => Promise<void>)[] = [];

  const addTransformer = (url: string, index: number | undefined) => {
    let data: LinkCardData;
    let isAmazonUrl = false;
    transformers.push(async () => {
      if (url.startsWith(amazonMeta.URL)) {
        const item = amazon.find(
          ({ key }) => key === url.split("/").slice(-1)[0]
        );
        if (!item) return;
        data = {
          ...item,
          faviconSrc: amazonMeta.FAVICON_URL,
          displayUrl: amazonMeta.DISPLAY_URL,
          url
        };
        isAmazonUrl = true;
      } else {
        data = await fetchOpenGraph(url);
      }

      const linkCardNode = createLinkCard(data, url, isAmazonUrl);
      if (index !== undefined) {
        tree.children.splice(index, 1, linkCardNode);
      }
    });
  };

  const isValidUrl = (url: string) => {
    if (!URL.canParse(url)) return false;
    const pattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
    return pattern.test(url);
  };

  let unmatched: Link | undefined;
  let processed: string;

  visit(
    tree,
    "paragraph",
    (paragraphNode: Parent, index: number | undefined, parent) => {
      if (parent?.type !== "root" || paragraphNode.children.length !== 1)
        return;

      visit(paragraphNode, "link", (linkNode: Link) => {
        if (
          linkNode.children.length !== 1 ||
          linkNode.children[0].type !== "text"
        )
          return;

        const childText = linkNode.children[0] as Text;
        if (!isSameUrl(linkNode.url, childText.value)) {
          unmatched = linkNode;
        }

        if (index !== undefined) {
          processed = linkNode.url;
          addTransformer(linkNode.url, index);
        }
      });

      visit(paragraphNode, "text", (textNode: Text) => {
        if (!isValidUrl(textNode.value) || processed === textNode.value) return;

        if (
          unmatched &&
          textNode.value === (unmatched.children[0] as Text).value &&
          textNode.position?.start.line === unmatched.position?.start.line
        ) {
          return;
        }

        if (index !== undefined) {
          addTransformer(textNode.value, index);
        }
      });
    }
  );

  try {
    await Promise.all(transformers.map((t) => t()));
  } catch (e) {
    console.warn(`[remark-link-card] Error: ${e}`);
  }

  return tree;
};

export default remarkLinkCard;
