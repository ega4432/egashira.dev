/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import { type GtmId } from "../src/components/GoogleTagManager.astro";

interface ImportMetaEnv {
  readonly GTM_ID: GtmId;
  readonly AD_CLIENT: string;
  readonly AD_SLOT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
