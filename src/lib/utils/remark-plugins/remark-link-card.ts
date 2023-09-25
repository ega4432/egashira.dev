import type { Parent, Node } from "unist";
import { visit } from "unist-util-visit";
import { encode } from "html-entities";
import ogs from "open-graph-scraper";
import type { ImageObject } from "open-graph-scraper/dist/lib/types";

interface TextNode extends Node {
  type: "text";
  value: string;
  children: Node[];
}

interface LinkNode extends Node {
  type: string;
  url: string;
}

interface OgObject {
  title: string;
  description: string;
  faviconSrc: string;
  ogImageSrc: string;
  displayUrl: string;
}

const faviconApiUrl = "https://www.google.com/s2/favicons?domain=";

const formatOgImageUrl = (
  ogImage: string | ImageObject | ImageObject[],
  url: string
) => {
  if (typeof ogImage === "string") {
    return ogImage.startsWith("/") ? `${url}${ogImage}` : ogImage;
  } else if (Array.isArray(ogImage)) {
    return ogImage[0].url.startsWith("/")
      ? `${url}${ogImage[0].url}`
      : ogImage[0].url;
  } else {
    return ogImage.url.startsWith("/") ? `${url}${ogImage.url}` : ogImage.url;
  }
};

const fetchOpenGraph = async (url: string): Promise<OgObject | null> => {
  try {
    const { result } = await ogs({
      url,
      onlyGetOpenGraphInfo: true
    });
    const parsedUrl = new URL(result.requestUrl || url);
    const title =
      (result.ogTitle && encode(result.ogTitle)) || parsedUrl.hostname;
    const description =
      (result.ogDescription && encode(result.ogDescription)) || "";
    const faviconSrc = `${faviconApiUrl}${parsedUrl.hostname}`;

    const ogImageSrc = result.ogImage
      ? formatOgImageUrl(result.ogImage, parsedUrl.origin)
      : "";
    const displayUrl = decodeURI(parsedUrl.hostname);
    return { title, description, faviconSrc, ogImageSrc, displayUrl };
  } catch (e) {
    console.warn(`Failed to fetch data for ${url}`);
    return null;
  }
};

const isExternal = (url: string) => !url.includes("egashira.dev");

const createLinkCard = (data: OgObject, targetUrl: string) => {
  const faviconElement = data.faviconSrc
    ? `<img class="my-0 mr-2 h-[15px] w-[15px] object-contain" src="${data.faviconSrc}" alt="${data.title} favicon" width="16" height="16">`.trim()
    : "";

  const descriptionElement = data.description
    ? `<div class="truncate text-xs leading-normal text-gray-500 dark:text-gray-400">${data.description}</div>`
    : "";

  const imageElement = data.ogImageSrc
    ? `<div class="h-[122px] w-[33.333%] max-w-[230px] md:w-auto">
    <img class="my-0 h-[100%] w-[100%] rounded-r-[0.275rem] object-cover" src="${data.ogImageSrc}" alt="${data.title}" />
  </div>`.trim()
    : "";

  return `
<a class="min-h-[122px] my-4 box-border flex flex-row justify-between rounded-md border-2 text-gray-800 no-underline hover:bg-gray-200 hover:!text-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" href="${targetUrl}" ${
    isExternal(targetUrl) ? 'target="_blank" rel="noopener noreferrer"' : ""
  }>
<div class="flex w-[50%] flex-1 flex-col justify-evenly break-words p-4 md:w-[65%]">
  <div class="text-xs font-semibold line-clamp-2 dark:text-gray-300 sm:text-sm md:text-base">${
    data.title
  }</div>
  ${descriptionElement}
  <div class="flex flex-row text-xs dark:text-gray-300">
    ${faviconElement}
    <span class="flex truncate flex-row text-xs dark:text-gray-300">${
      data.displayUrl
    }</span>
  </div>
</div>
${imageElement}
</a>
`.trim();
};

const addProperties = (node: LinkNode) => {
  node.data = {
    hProperties: {
      target: "_blank",
      rel: "noopener noreferrer"
    }
  };
};

const remarkLinkCard = () => {
  const transformers: (() => Promise<void>)[] = [];
  return async (tree: Parent) => {
    visit(
      tree,
      "paragraph",
      (paragraphNode: Parent, index: number | undefined) => {
        if (!index) return;

        visit(paragraphNode, "link", (linkNode: LinkNode) => {
          if (linkNode.url && isExternal(linkNode.url)) {
            addProperties(linkNode);
          }
        });

        if (
          paragraphNode.children.length !== 1 ||
          (paragraphNode && paragraphNode.data !== undefined)
        )
          return;

        visit(paragraphNode, "text", (textNode: TextNode) => {
          const urls = textNode.value.match(
            /(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/g
          );
          if (urls && urls.length === 1) {
            transformers.push(async () => {
              const data = await fetchOpenGraph(urls[0]);
              if (!data) return;

              const linkCardHtml = createLinkCard(data, urls[0]);
              const linkCardNode = {
                type: "html",
                value: linkCardHtml
              };

              // Replace paragraph node with linkCardNode
              tree.children.splice(index, 1, linkCardNode);
            });
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
};

export default remarkLinkCard;
