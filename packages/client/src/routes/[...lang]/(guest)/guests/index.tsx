import { component$ } from "@builder.io/qwik";
import { $translate as t, Speak } from "qwik-speak";
import { GuestList } from "~/components/guestlist/guestlist";
import { paths } from "~/utils/paths";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { generateRoutingLink } from "~/utils/common.functions";

export default component$(() => {
  const location = useLocation();
  return (
    <Speak assets={["list", "guestlist"]}>
      <div class="grid mb-6 md:grid-cols-3 w-full">
        <div class="ml-12 self-start text-xl">
          <a
            href={generateRoutingLink(location.params.lang, paths.newGuest)}
            role="button"
            class="block max-w-[15rem] max-h-[7rem] mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-lg w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <div>
              <i class="fa-solid fa-person-circle-plus"></i>{" "}
              {t("guestlist.addGuest@@Add Guest")}
            </div>
          </a>
        </div>
        <h1 class="text-center self-center text-3xl font-semibold text-black dark:text-white">
          {t("list.guests@@Guests")}
        </h1>
      </div>
      <GuestList openedFromEvent={false} />
    </Speak>
  );
});

export const head: DocumentHead = {
  title: 'Guests',
};