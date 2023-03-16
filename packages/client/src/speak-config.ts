import { $ } from "@builder.io/qwik";
import { isDev, isServer } from "@builder.io/qwik/build";
import type { LoadTranslationFn, SpeakConfig, TranslationFn } from "qwik-speak";

/**
 * Speak config
 */
export const config: SpeakConfig = {
  defaultLocale: {
    lang: "en-US",
    currency: "USD",
    timeZone: "America/Los_Angeles",
    units: { length: "mile" },
  },
  supportedLocales: [
    {
      lang: "hu-HU",
      currency: "HUF",
      timeZone: "Europe/Budapest",
      units: { length: "kilometer" },
    },
    {
      lang: "en-US",
      currency: "USD",
      timeZone: "America/Los_Angeles",
      units: { length: "mile" },
    },
  ],
  assets: [
    "auth",
    "budgetPlanning",
    "common",
    "contacts",
    "event",
    "feedback",
    "guestlist",
    "header",
    "home",
    "list",
    "location",
    "modal",
    "profile",
    "toast",
  ],
};

/**
 * E.g. Fetch translation data from json files
 * In productions with inlined translations, only the runtime file is loaded
 */
export const loadTranslation$: LoadTranslationFn = $(
  async (lang: string, asset: string, origin?: string) => {
    if (isDev || asset === "runtime") {
      let url = "";
      // Absolute urls on server
      if (isServer && origin) {
        url = origin;
      }
      url += `/i18n/${lang}/${asset}.json`;
      const response = await fetch(url);

      if (response.ok) {
        return response.json();
      } else if (response.status === 404) {
        console.warn(`loadTranslation$: ${url} not found`);
      }
    }
  }
);

/**
 * Translation functions
 */
export const translationFn: TranslationFn = {
  loadTranslation$: loadTranslation$,
};
