/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@astrojs/image/client" />

import { GtmId } from "../src/components/GoogleTagManager.astro";

interface ImportMetaEnv {
  readonly GTM_ID: GtmId;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
