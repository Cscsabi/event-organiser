import {
  component$,
  Slot,
  useSignal,
  useVisibleTask$,
  useContextProvider,
  createContextId,
} from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import { ProtectedHeader } from "~/components/header/protectedHeader";
import { PublicHeader } from "~/components/header/publicHeader";
import type { RequestHandler } from "@builder.io/qwik-city";
import { getUser } from "~/utils/supabase.client";
import { config } from "~/speak-config";

export const CTX = createContextId<Signal<string>>("header-type");

export default component$(() => {
  const userEmail: Signal<string> = useSignal("");
  const privateHeader: Signal<boolean | undefined> = useSignal();

  useContextProvider<Signal<string>>(CTX, userEmail);

  useVisibleTask$(async ({ track }) => {
    track(() => userEmail.value);
    const userResponse = await getUser();
    userEmail.value = userResponse.data.user?.email ?? "";
    if (userEmail.value.length > 0) {
      privateHeader.value = true;
    } else {
      privateHeader.value = false;
    }
  });

  return (
    <>
      <main class="bg-green-300 dark:bg-indigo-900 overflow-hidden rounded-3xl">
        {privateHeader.value === undefined ? (
          <nav class="px-2 min-h-[3.5rem] bg-green-200 border-gray-200 dark:bg-gray-800 dark:border-gray-700"></nav>
        ) : privateHeader.value ? (
          <ProtectedHeader />
        ) : (
          <PublicHeader />
        )}
        <section class="border-b-green-800 dark:border-b-indigo-300 border-solid border-b-8 p-6">
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
