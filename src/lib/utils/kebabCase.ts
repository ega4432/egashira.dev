import { slug } from "github-slugger";

export const kebabCase = (text: string) => slug(text);
