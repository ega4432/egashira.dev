import type { Parent } from "unist";
import { visit } from "unist-util-visit";

export default function remarkCodeTitles() {
  return (tree: Parent & { lang?: string }) =>
    visit(
      tree,
      "code",
      (
        node: Parent & { lang?: string },
        index: number | undefined,
        parent: Parent
      ) => {
        if (!index) return;

        const nodeLang = node.lang || "";
        let language = "";
        let title = "";

        if (nodeLang.includes(":")) {
          language = nodeLang.slice(0, nodeLang.search(":"));
          title = nodeLang.slice(nodeLang.search(":") + 1, nodeLang.length);
        }

        if (!title) return;

        const className = "remark-code-title";
        const titleNode = {
          type: "html",
          value: `<div class="${className}">${title}</div>`.trim()
        };

        parent.children.splice(index, 0, titleNode);
        node.lang = language;
      }
    );
}
