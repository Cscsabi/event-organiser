import { component$ } from "@builder.io/qwik";
import { $translate as t, Speak } from "qwik-speak";
import { Contact } from "~/components/contacts/contacts";

export default component$(() => {
  return (
    <Speak assets={["list"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("list.contacts@@Contacts")}
      </h1>
      <Contact />
    </Speak>
  );
});
