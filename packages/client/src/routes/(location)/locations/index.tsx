import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { List } from "~/components/list/list";

export default component$(() => {
  return (
    <div>
      <Link href={paths.newLocation} class="add-location-button">
        <button
          type="button"
          class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        >
          <i class="fa-solid fa-map-pin"></i> Add Location
        </button>
      </Link>
      <List isEvent={false} />
    </div>
  );
});
