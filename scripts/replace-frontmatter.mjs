import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

(async () => {
  const targetDir = "./src/content/blog/";
  const files = await readdir(targetDir);

  for await (const file of files) {
    if (path.extname(file) !== ".md") {
      continue;
    }

    const filePath = path.join(targetDir, file);

    const content = await readFile(filePath, "utf-8");
    const newContent = content.replace(/(slug:\s*)(.*)/, "notion: true");

    if (content !== newContent) {
      // `slug: xxx` を含む行を `notion: true` に置き換える
      await writeFile(
        filePath,
        content.replace(/(slug:\s*)(.*)/, "notion: true"),
        "utf-8"
      );

      console.log(`Updated successfully: ${filePath}`);
    }
  }
})();
