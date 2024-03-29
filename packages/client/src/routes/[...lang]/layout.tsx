import {
  $,
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  useLocation,
  useNavigate,
  type RequestHandler,
} from "@builder.io/qwik-city";
import {
  changeLocale,
  useSpeakContext,
  useSpeakLocale,
  type SpeakLocale,
} from "qwik-speak";
import { ProtectedHeader } from "~/components/header/protectedHeader";
import { PublicHeader } from "~/components/header/publicHeader";
import { config } from "~/speak-config";
import { generateRoutingLink } from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { getSession } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import type { UserContext } from "~/utils/types";

export const CTX = createContextId<UserContext>("user");

export default component$(() => {
  const ctx = useSpeakContext();
  const locale = useSpeakLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore<UserContext>({});

  useContextProvider<UserContext>(CTX, user);

  // Replace locale in URL
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

  useVisibleTask$(async ({ track }) => {
    track(() => location.params.lang);

    if (user.userEmail === undefined) {
      user.userEmail = (await getSession())?.user.email ?? "";
    }

    const userData = await client.getUser.query({
      email: user.userEmail ?? "",
    });

    user.privateHeader = Boolean(user.userEmail);
    user.darkModeEnabled = userData.user?.darkModeEnabled;
    user.language = userData.user?.language ?? "";
    user.firstname = userData.user?.firstname;
    user.lastname = userData.user?.lastname;
    user.turnOffHints = userData.user?.turnOffHints;

    if (user.language === "hu-HU" && location.params.lang === "") {
      await localizeUrl$({ lang: "hu-HU" });
    } else if (user.language === "en-US" && location.params.lang === "hu-HU") {
      await localizeUrl$({ lang: "en-US" });
    }

    const newLocale =
      config.supportedLocales.find(
        (value) => value.lang === location.params.lang
      ) || config.defaultLocale;

    if (newLocale.lang !== locale.lang) {
      await changeLocale(newLocale, ctx);
    }
  });

  useVisibleTask$(async ({ track }) => {
    track(() => user.userEmail);

    if (user.userEmail === undefined || user.userEmail === "") {
      const session = await getSession();
      user.privateHeader = Boolean(user.userEmail);

      if (session?.user === undefined) {
        const path = window.location.pathname;
        if (
          !(
            path.endsWith("/login/") ||
            path.endsWith("/register/") ||
            path === "/hu-HU/" ||
            path.includes("/feedback/") ||
            path === "/"
          )
        ) {
          navigate(
            generateRoutingLink(location.params.lang, paths.login),
            true
          );
        }
      } else {
        user.userEmail = session.user.email;
      }
    }
  });

  return (
    <>
      <main class="bg-slate-300 dark:bg-slate-800 overflow-hidden rounded-3xl">
        {user.privateHeader === undefined ? (
          <nav class="px-2 min-h-[3.5rem] bg-slate-400 border-gray-200 dark:bg-black dark:border-gray-700"></nav>
        ) : user.privateHeader ? (
          <ProtectedHeader />
        ) : (
          <PublicHeader />
        )}
        <section class="border-b-slate-300 dark:border-b-black border-solid border-b-8 p-6">
          <Slot />
        </section>
        <script
          src="https://kit.fontawesome.com/bb097e18f6.js"
          crossOrigin="anonymous"
        ></script>
      </main>
    </>
  );
});

export const onRequest: RequestHandler = ({ params, locale }) => {
  const lang = params.lang;

  // Set Qwik locale
  locale(lang || config.defaultLocale.lang);
};
