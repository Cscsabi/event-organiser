import { component$, useTask$, useSignal } from "@builder.io/qwik";
import { Contact } from "~/components/contacts/contacts";
import { getUser } from "~/utils/supabase.client";

export default component$(() => {
  const email = useSignal<string>("");

  useTask$(async ({ track }) => {
    track(() => email.value);
    const result = await getUser();
    email.value = result.data.user?.email ?? "";
  });

  return (
    <>
      <Contact userEmail={email.value} />
    </>
  );
});
