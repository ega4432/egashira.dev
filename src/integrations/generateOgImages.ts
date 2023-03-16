import type { AstroIntegration } from "astro";
import { read } from "gray-matter";
import satori from "satori";
import { readFile, writeFile, mkdir, stat } from "fs/promises";
import { Resvg } from "@resvg/resvg-js";

const getTitleFromMarkdownFm = (mdFilePath: string) => {
  const { data } = read(mdFilePath);
  return data.title || "";
};

const generate = async (
  title: string,
  { background, font }: { background: string; font: Buffer }
) => {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          width: 1200,
          height: 630,
          backgroundImage: `url(${background})`,
          backgroundSize: "1200px 630px"
        },
        children: {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              width: 1040,
              height: 390,
              marginTop: 80,
              marginLeft: 80,
              fontSize: "70px",
              fontWeight: "bold",
              textOverflow: "ellipsis"
            },
            children: title
          }
        }
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "NotoSansJP",
          data: font,
          weight: 500,
          style: "normal"
        }
      ]
    }
  );

  const resvg = new Resvg(svg);
  return resvg.render().asPng();
};

const createDirectory = async (path: string, recursive: boolean = true) => {
  await stat(path).catch(async (e) => {
    if (e.code === "ENOENT") {
      await mkdir(path, { recursive });
    }
  });
};

export default function generateOgImage(): AstroIntegration {
  return {
    name: "generate-og-image",
    hooks: {
      "astro:build:done": async ({ pages }) => {
        const blogPaths = pages
          .filter((page) => page.pathname.startsWith("blog/"))
          .map((page) => page.pathname);

        const assetPath = "src/integrations/assets";
        const background = await readFile(
          `${assetPath}/background.png`,
          "base64"
        );
        const font = await readFile(`${assetPath}/NotoSansJP-Bold.otf`);

        const dist = "dist/images/";
        for await (const blogPath of blogPaths) {
          const title = getTitleFromMarkdownFm(`src/content/${blogPath}.md`);

          await createDirectory(`${dist}/${blogPath}`);

          const buffer = await generate(title, {
            background: `data:image/png;base64,${background}`,
            font
          });

          await writeFile(`${dist}/${blogPath}/ogp.png`, buffer);
        }
      }
    }
  };
}
