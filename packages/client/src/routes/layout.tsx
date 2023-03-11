import {
  component$,
  Slot,
  useSignal,
  useBrowserVisibleTask$,
  useContextProvider,
  createContextId,
} from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import { ProtectedHeader } from "~/components/header/protectedHeader";
import { PublicHeader } from "../components/header/publicHeader";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getUser } from "~/utils/supabase.client";

export const CTX = createContextId<Signal<string>>("header-type");

export default component$(() => {
  const userEmail: Signal<string> = useSignal("");

  useContextProvider<Signal<string>>(CTX, userEmail);

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => userEmail.value);
    const userResponse = await getUser();
    userEmail.value = userResponse.data.user?.email ?? "";
  });

  return (
    <>
      <main class="bg-green-300 dark:bg-indigo-900 overflow-hidden rounded-3xl">
        {userEmail.value.length > 0 ? <ProtectedHeader /> : <PublicHeader />}
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

export const head: DocumentHead = {
  title: "Event Organiser",
  meta: [
    {
      name: "description",
      content: "Event organiser",
    },
  ],
};
