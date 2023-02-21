import { component$ } from "@builder.io/qwik";
import { List } from "~/components/list/list";

export default component$(() => {
  return <List isEvent={true} isActive={false} />;
});
