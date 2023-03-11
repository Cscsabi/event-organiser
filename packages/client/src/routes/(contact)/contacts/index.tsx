import {
  component$,
  useBrowserVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import { Contact } from "~/components/contacts/contacts";
import { getUser } from "~/utils/supabase.client";

export default component$(() => {
  const email = useSignal<string>("");

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => email.value);
    const result = await getUser();
    email.value = result.data.user?.email ?? "";
  });

  return (
    <>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        Contacts
      </h1>
      <Contact userEmail={email.value} />
    </>
  );
});
