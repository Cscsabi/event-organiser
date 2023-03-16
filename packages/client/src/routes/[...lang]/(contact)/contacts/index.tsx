import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { Contact } from "~/components/contacts/contacts";
import { getUser } from "~/utils/supabase.client";
import { $translate as t, Speak } from "qwik-speak";

export default component$(() => {
  const email = useSignal<string>("");

  useVisibleTask$(async ({ track }) => {
    track(() => email.value);
    const result = await getUser();
    email.value = result.data.user?.email ?? "";
  });

  return (
    <Speak assets={["list"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("list.contacts@@Contacts")}
      </h1>
      <Contact userEmail={email.value} />
    </Speak>
  );
});
