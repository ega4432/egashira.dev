import { Client } from "@notionhq/client";
import axios from "axios";
import qs from "qs";

const {
  NOTION_API_KEY: auth,
  NOTION_DATABASE_ID: databaseId,
  IMGUR_CLIENT_ID: clientId,
  IMGUR_CLIENT_SECRET: clientSecret,
  IMGUR_REFRESH_TOKEN: refreshToken
} = process.env;

const axiosInstance = axios.create({
  baseURL: "https://api.imgur.com",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json"
  }
});

const getLatestPages = async (id) => {
  const { results } = await client.databases.query({
    database_id: id,
    filter: {
      timestamp: "last_edited_time",
      last_edited_time: {
        past_week: {}
      }
    }
  });

  return results.filter((page) => !page.archived).map((page) => page.id);
};

const getImageBlocks = async (id) => {
  const { results } = await client.blocks.children.list({ block_id: id });

  return results.filter(
    (block) => block.type === "image" && block.image?.type === "file"
  );
};

const getImgurToken = async () => {
  try {
    const { data } = await axiosInstance.post("/oauth2/token", {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    });

    return data.access_token || "";
  } catch (e) {
    console.error(e);
    return "";
  }
};

const uploadImage = async (token, url, title = "") => {
  try {
    const uploadData = {
      image: url,
      title,
      type: "url"
    };

    const { data } = await axiosInstance.post(
      "/3/image",
      qs.stringify(uploadData),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    return data.data.id || "";
  } catch (e) {
    console.error(e);
    return "";
  }
};

const updateBlock = async (blockId, imgurId) => {
  const url = `https://i.imgur.com/${imgurId}.webp`;
  const resp = await client.blocks.update({
    block_id: blockId,
    image: { external: { url } }
  });

  return resp.image?.external?.url === url;
};

const client = new Client({ auth });

(async () => {
  if (!clientId || !clientSecret || !refreshToken || !auth || !databaseId) {
    console.error("One of the credential is not found.");
    return;
  }

  const pageIds = await getLatestPages(databaseId);
  if (!pageIds.length) {
    console.log("Target page not found.");
    return;
  }

  console.log(`Target pages are found.\n\t${pageIds.join("\n\t")}`);

  const imgurToken = await getImgurToken();

  if (!imgurToken) {
    console.error("Failed to obtain the imgur token.");
    return;
  }

  for (const pageId of pageIds) {
    const blocks = await getImageBlocks(pageId);
    if (!blocks.length) {
      console.log(`Skipped this loop because target block was not found.`);
      continue;
    }

    console.log(`Target blocks are found.\n\t${blocks.join("\n\t")}`);

    for (const block of blocks) {
      const caption = block.image.caption.length
        ? block.image.caption.map((data) => data.plain_text).join("")
        : "";
      const id = await uploadImage(imgurToken, block.image.file.url, caption);

      if (!id) {
        console.log("Failed to upload image");
        console.log(`block_id is: ${block.id}`);
        continue;
      }

      console.log(`Uploaded image(block_id: ${block.id}) successfully!`);

      const ok = await updateBlock(block.id, id);

      if (ok) {
        console.log(`Updated block(${block.id}) successfully!`);
      } else {
        console.log(`Failed to update block(${block.id})`);
      }
    }
  }
})();
