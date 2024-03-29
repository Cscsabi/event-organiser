import { component$, useVisibleTask$, useSignal, $ } from "@builder.io/qwik";
import { paths } from "~/utils/paths";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { generateRoutingLink } from "~/utils/common.functions";
import {
  $translate as t,
  Speak,
  useSpeakConfig,
  type SpeakLocale,
} from "qwik-speak";

export const PublicHeader = component$(() => {
  const isEnglish = useSignal<boolean>();
  const darkMode = useSignal<boolean>();
  const location = useLocation();
  const navigate = useNavigate();
  const config = useSpeakConfig();

  const localizeUrl$ = $((newLocale: SpeakLocale) => {
    let pathname = location.url.pathname;
    if (location.params.lang) {
      if (newLocale.lang !== config.defaultLocale.lang) {
        pathname = pathname.replace(location.params.lang, newLocale.lang);
      } else {
        pathname = pathname.replace(
          new RegExp(`(/${location.params.lang}/)|(/${location.params.lang}$)`),
          "/"
        );
      }
    } else if (newLocale.lang !== config.defaultLocale.lang) {
      pathname = `/${newLocale.lang}${pathname}`;
    }

    navigate(pathname, true);
  });

  useVisibleTask$(({ track }) => {
    track(() => darkMode.value);

    const rootTag = document.getElementsByTagName("html")[0];
    if (darkMode.value === undefined) {
      darkMode.value = rootTag.classList.contains("dark");
    }

    if (darkMode.value && !rootTag.classList.contains("dark")) {
      rootTag.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (!darkMode.value && rootTag.classList.contains("dark")) {
      rootTag.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });

  return (
    <Speak assets={["header", "common"]}>
      <nav class="px-2 bg-slate-400 border-gray-400 dark:bg-black dark:border-gray-700">
        <div class="container flex flex-wrap items-center justify-between mx-auto">
          <ul class="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-slate-400 md:flex-row md:space-x-8 md:mt-0 md:text-xl md:font-medium md:border-0 md:bg-slate-400 dark:bg-black md:dark:bg-black dark:border-gray-700">
            <li>
              <a
                class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 hover:text-blue-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-blue-500 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                href={generateRoutingLink(location.params.lang, paths.index)}
              >
                <div>
                  <i class="fa-solid fa-house"></i> {t("header.home@@Home")}
                </div>
              </a>
            </li>
            <li>
              <div class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 hover:text-blue-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-blue-500 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                <button
                  type="button"
                  onClick$={() => {
                    darkMode.value = !darkMode.value;
                  }}
                >
                  {darkMode.value === undefined ? (
                    ""
                  ) : !darkMode.value ? (
                    <div>
                      <i class="fa-regular fa-moon "></i>{" "}
                      {t("header.dark@@Dark mode")}
                    </div>
                  ) : (
                    <div>
                      <i class="fa-regular fa-sun "></i>{" "}
                      {t("header.light@@Light mode")}
                    </div>
                  )}
                </button>
              </div>
            </li>
            <li>
              <div class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 hover:text-blue-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-blue-500 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                <button
                  onClick$={async () => {
                    isEnglish.value = !isEnglish.value;
                    const speakLocale: SpeakLocale = isEnglish.value
                      ? { lang: "en-US" }
                      : { lang: "hu-HU" };

                    localizeUrl$(speakLocale);
                  }}
                  type="button"
                >
                  {!isEnglish.value ? (
                    <div>
                      <i class="fa-solid fa-language"></i>{" "}
                      {t("header.english@@English")}
                    </div>
                  ) : (
                    <div>
                      <i class="fa-solid fa-language"></i>{" "}
                      {t("header.hungarian@@Hungarian")}
                    </div>
                  )}
                </button>
              </div>
            </li>
          </ul>
          <div class="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul class="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-slate-400 md:flex-row md:space-x-8 md:mt-0 md:text-xl md:font-medium md:border-0 md:bg-slate-400 dark:bg-black md:dark:bg-black dark:border-gray-700">
              <li>
                <a
                  role="button"
                  class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 hover:text-blue-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-blue-500 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                  href={generateRoutingLink(location.params.lang, paths.login)}
                >
                  <div>
                    <i class="fa-solid fa-right-to-bracket"></i>{" "}
                    {t("common.login@@Login")}
                  </div>
                </a>
              </li>
              <li>
                <a
                  role="button"
                  class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 hover:text-blue-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-blue-500 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                  href={generateRoutingLink(
                    location.params.lang,
                    paths.register
                  )}
                >
                  <div>
                    <i class="fa-solid fa-user-plus"></i>{" "}
                    {t("common.register@@Register")}
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </Speak>
  );
});
