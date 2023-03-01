import { component$, useBrowserVisibleTask$, useSignal } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { Contact } from "~/components/contacts/contacts";
import { getUser } from "~/utils/supabase.client";

export default component$(() => {
  const email = useSignal<string>("");
  const { params } = useLocation();

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => email.value);
    console.log(params);
    const result = await getUser();
    email.value = result.data.user?.email ?? "";
  });

  return (
    <>
      <Contact userEmail={email.value} />
    </>
  );
});
