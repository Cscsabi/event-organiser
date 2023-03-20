import { component$ } from "@builder.io/qwik";
import { $translate as t, Speak } from "qwik-speak";
import { GuestList } from "~/components/guestlist/guestlist";

export default component$(() => {
  return (
    <Speak assets={["list"]}>
      <h1 class="mb-3 text-center text-3xl font-semibold text-black dark:text-white">
        {t("list.guests@@Guests")}
      </h1>
      <GuestList openedFromEvent={false} />
    </Speak>
  );
});
