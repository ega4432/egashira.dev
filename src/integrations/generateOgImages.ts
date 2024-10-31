import type { AstroIntegration } from "astro";
import matter from "gray-matter";
import { readFile, writeFile, mkdir, stat } from "fs/promises";
import satori from "satori";
import sharp from "sharp";

const getTitleFromMarkdownFm = (mdFilePath: string) => {
  const { data } = matter.read(mdFilePath);
  return data.title || "";
};

const generate = async (
  title: string,
  { background, font }: { background: string; font: Buffer }
) => {
  const element = {
    type: "div",
    props: {
      style: {
        alignItems: "center",
        backgroundImage: `url(${background})`,
        backgroundSize: "1200px 630px",
        display: "flex",
        justifyContent: "center",
        height: 630,
        textAlign: "start",
        width: 1200
      },
      children: {
        type: "div",
        props: {
          style: {
            display: "flex",
            fontSize: "60px",
            fontWeight: "bold",
            height: 390,
            marginTop: 80,
            textOverflow: "ellipsis",
            width: 1040
          },
          children: title
        }
      }
    }
  };

  const svg = await satori(element, {
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
  });

  return await sharp(Buffer.from(svg)).png().toBuffer();
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

          await writeFile(`${dist}/${blogPath}/og.png`, buffer);
        }
      }
    }
  };
}
