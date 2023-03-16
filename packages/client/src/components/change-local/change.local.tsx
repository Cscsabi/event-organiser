import { $, component$, useTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import {
  changeLocale,
  useSpeakContext,
  useSpeakLocale,
  useSpeakConfig,
} from "qwik-speak";
import { useSignal } from "@builder.io/qwik";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { $translate as t, Speak, type SpeakLocale } from "qwik-speak";

export const ChangeLocale = component$(() => {
  const isEnglish = useSignal<boolean>();
  const userEmail = useSignal<string>("");
  const loc = useLocation();
  const nav = useNavigate();

  const ctx = useSpeakContext();
  const locale = useSpeakLocale();
  const config = useSpeakConfig();

  // Replace locale in URL
  const localizeUrl$ = $((newLocale: SpeakLocale) => {
    let pathname = loc.url.pathname;
    if (loc.params.lang) {
      if (newLocale.lang !== config.defaultLocale.lang) {
        pathname = pathname.replace(loc.params.lang, newLocale.lang);
      } else {
        pathname = pathname.replace(
          new RegExp(`(/${loc.params.lang}/)|(/${loc.params.lang}$)`),
          "/"
        );
      }
    } else if (newLocale.lang !== config.defaultLocale.lang) {
      pathname = `/${newLocale.lang}${pathname}`;
    }

    // No full-page reload
    nav(pathname);
  });

  // Handle localized routing
  useTask$(async ({ track }) => {
    track(() => loc.params.lang);

    if (userEmail.value === "") {
      userEmail.value = (await getUser()).data.user?.email ?? "";
    }

    if (isEnglish.value === undefined) {
      const userData = await client.getUser.query({
        email: userEmail.value,
      });

      if (userData.user?.language === "hu-HU") {
        localizeUrl$({ lang: "hu-HU" });
      }
    } else if (loc.params.lang === "hu-HU") {
      isEnglish.value = false;
    }

    const newLocale =
      config.supportedLocales.find((value) => value.lang === loc.params.lang) ||
      config.defaultLocale;

    if (newLocale.lang !== locale.lang) {
      await changeLocale(newLocale, ctx);
    }
  });

  return (
    <Speak assets={["header"]}>
      <div class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
        <button
          onClick$={async () => {
            isEnglish.value = !isEnglish.value;
            const speakLocale: SpeakLocale = isEnglish.value
              ? { lang: "en-US" }
              : { lang: "hu-HU" };

            localizeUrl$(speakLocale);

            client.updateUser.mutate({
              params: { email: userEmail.value },
              body: {
                language: speakLocale.lang,
              },
            });
          }}
          type="button"
        >
          {!isEnglish.value ? (
            <div>
              <i class="fa-solid fa-language"></i> {t("header.english@@English")}
            </div>
          ) : (
            <div>
              <i class="fa-solid fa-language"></i> {t("header.hungarian@@Hungarian")}
            </div>
          )}
        </button>
      </div>
    </Speak>
  );
});
