import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { List } from "~/components/list/list";

export default component$(() => {
  return (
    <div>
      <Link href={paths.newLocation} class="add-location-button">
        <i class="fa-solid fa-map-pin"></i> Add Location
      </Link>
      <List isEvent={false} />
    </div>
  );
});
