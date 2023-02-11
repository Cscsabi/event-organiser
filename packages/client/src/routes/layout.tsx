import {
  component$,
  Slot,
  useSignal,
  useClientEffect$,
  createContext,
  useContextProvider,
} from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import { ProtectedHeader } from "~/components/header/protectedHeader";
import { PublicHeader } from "../components/header/publicHeader";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getUser } from "~/utils/supabase.client";

export const CTX = createContext<Signal<string>>("header-type");

export default component$(() => {
  const userEmail: Signal<string> = useSignal("");

  useContextProvider<Signal<string>>(CTX, userEmail);

  useClientEffect$(async ({ track }) => {
    track(() => userEmail.value);
    const userResponse = await getUser();
    userEmail.value = userResponse.data.user?.email || "";
  });

  return (
    <>
      <main>
        <section>
          {userEmail.value ? <ProtectedHeader /> : <PublicHeader />}
          <Slot />
          <script
            src="https://kit.fontawesome.com/bb097e18f6.js"
            crossOrigin="anonymous"
          ></script>
        </section>
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
