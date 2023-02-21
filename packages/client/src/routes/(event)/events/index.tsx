import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { List } from "~/components/list/list";
import { paths } from "~/utils/paths";

export default component$(() => {
  return (
    <div>
      <Link href={paths.newEvent} class="add-event-button">
        <i class="fa-solid fa-calendar-plus"></i> Add Event
      </Link>
      <List isEvent={true} isActive={true} />
    </div>
  );
});
