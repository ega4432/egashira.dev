/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import { type GtmId } from "../src/components/GoogleTagManager.astro";
import { type ADClient } from "./components/GoogleAdsense.astro";

interface ImportMetaEnv {
  readonly GTM_ID: GtmId;
  readonly AD_CLIENT: ADClient;
  readonly AD_SLOT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle?: { [key: string]: unknown }[];
}

declare global {
  const window: Window;
}
