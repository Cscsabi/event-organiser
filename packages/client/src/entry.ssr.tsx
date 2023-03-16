/**
 * WHAT IS THIS FILE?
 *
 * SSR entry point, in all cases the application is render outside the browser, this
 * entry point will be the common one.
 *
 * - Server (express, cloudflare...)
 * - npm run start
 * - npm run preview
 * - npm run build
 *
 */
import { renderToStream } from "@builder.io/qwik/server";
import type { RenderToStreamOptions } from "@builder.io/qwik/server";
import { manifest } from "@qwik-client-manifest";
import Root from "./root";
import { config } from "./speak-config";
import type { RenderOptions } from "@builder.io/qwik";
import { isDev } from "@builder.io/qwik/build";

export function extractBase({ serverData }: RenderOptions): string {
  if (!isDev && serverData?.qwikcity?.params.lang) {
    return "/build/" + serverData.qwikcity.params.lang;
  } else {
    return "/build";
  }
}

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest,
    ...opts,
    // Use container attributes to set attributes on the html tag.
    containerAttributes: {
      lang: opts.serverData?.locale || config.defaultLocale.lang,
      ...opts.containerAttributes,
    },
    base: extractBase,
    serverData: {
      ...opts.serverData,
      locale:
        opts.serverData?.qwikcity?.params.lang || config.defaultLocale.lang,
    },
  });
}
