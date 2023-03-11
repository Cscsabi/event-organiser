import { component$ } from "@builder.io/qwik";
import { List } from "~/components/list/list";

export default component$(() => {
  return (
    <>
      <h1 class="mb-12 text-center text-3xl font-semibold text-black dark:text-white">
        Locations
      </h1>
      <List isEvent={false} />
    </>
  );
});
