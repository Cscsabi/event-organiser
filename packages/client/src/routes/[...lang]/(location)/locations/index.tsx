import { component$ } from "@builder.io/qwik";
import { List } from "~/components/list/list";
import { $translate as t, Speak } from "qwik-speak";
import { paths } from "~/utils/paths";

export default component$(() => {
  return (
    <Speak assets={["list"]}>
      <div class="grid mb-6 md:grid-cols-3 w-full">
        <div class="text-left ml-12 self-start">
          <a
            href={paths.newLocation}
            role="button"
            class="block max-w-[15rem] max-h-[7rem] mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
          >
            <div>
              <i class="fa-solid fa-map-location-dot"></i>{" "}
              {t("list.addLocation@@Add Location")}
            </div>
          </a>
        </div>
        <h1 class="text-center self-center text-3xl font-semibold text-black dark:text-white">
          {t("list.locations@@Locations")}
        </h1>
      </div>
      <List isEvent={false} />
    </Speak>
  );
});
