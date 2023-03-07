import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import axios from "axios";
import qs from "qs";

const targetDir = "./src/content/blog/";
const endpoint = "https://api.imgur.com/3/image";
const clientId = process.env.IMGUR_CLIENT_ID;
const clientSecret = process.env.IMGUR_CLIENT_SECRET;
const refreshToken = process.env.IMGUR_REFRESH_TOKEN;

const findImages = (content) => {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  const images = [];

  while ((match = regex.exec(content))) {
    const [, alt, src] = match;

    // 画像をパスで指定している箇所を抜き出す
    if (!/^https:\/\//.test(src)) {
      images.push({ alt, src });
    }
  }

  return images;
};

const upload = async (imagePath) => {
  const image = await readFile(path.join(targetDir, imagePath));

  const uploadData = {
    image: Buffer.from(image).toString("base64")
  };

  const accessToken = "aeb7c2d360cb34930e7041a7f6cfcd44409327bb";
  const clientId = "b2da4209ef6df10";

  const resp = await axios.post(endpoint, qs.stringify(uploadData), {
    headers: {
      // Authorization: `Bearer ${accessToken}`,
      Authorization: `Client-ID ${clientId}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  console.log(resp);

  // return resp;
};

(async () => {
  const files = await readdir(targetDir);

  // TODO: imgur client create
  if (!clientId || !clientSecret || !refreshToken) {
    console.error("Credentials are invalid for imgur API");
    return;
  }

  for await (const file of files) {
    if (path.extname(file) !== ".md") continue;

    const content = await readFile(path.join(targetDir, file), "utf-8");
    const fm = matter(content);

    if (!fm.data.notion) continue;

    const images = findImages(content);
    if (!images.length) continue;

    console.log(images);

    for (const image of images) {
      const { alt, src } = image;
      // TODO: imgur へアップロード
      await upload(src);
    }

    // TODO: ![]() の部分を URL に書き換え
  }
})();
