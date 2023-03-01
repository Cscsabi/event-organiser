import { component$ } from "@builder.io/qwik";
import { paths } from "~/utils/paths";
import { List } from "~/components/list/list";

export default component$(() => {
  return (
    <div>
      <a href={paths.newLocation} class="add-location-button">
        <i class="fa-solid fa-map-pin"></i> Add Location
      </a>
      <List isEvent={false} />
    </div>
  );
});
