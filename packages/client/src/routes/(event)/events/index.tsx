import { component$ } from "@builder.io/qwik";
import { List } from "~/components/list/list";
import { paths } from "~/utils/paths";

export default component$(() => {
  return (
    <div>
      <a href={paths.newEvent} class="add-event-button">
        <i class="fa-solid fa-calendar-plus"></i> Add Event
      </a>
      <List isEvent={true} isActive={true} />
    </div>
  );
});
