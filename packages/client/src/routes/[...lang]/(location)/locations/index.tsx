import { component$ } from "@builder.io/qwik";
import { List } from "~/components/list/list";
import { $translate as t, Speak } from "qwik-speak";

export default component$(() => {
  return (
    <Speak assets={["list"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("list.locations@@Locations")}
      </h1>
      <List isEvent={false} />
    </Speak>
  );
});
