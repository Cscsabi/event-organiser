import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { useNavigate, useLocation } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { GuestList } from "~/components/guestlist/guestlist";
import { generateRoutingLink } from "~/utils/common.functions";
import { $translate as t, Speak } from "qwik-speak";

export default component$(() => {
  const userEmail = useSignal<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  useVisibleTask$(async ({ track }) => {
    track(() => userEmail.value);
    userEmail.value = (await getUser()).data.user?.email ?? "";
    if (userEmail.value === "") {
      navigate(generateRoutingLink(location.params.lang, paths.login));
    }
  });

  return (
    <Speak assets={["list"]}>
      <h1 class="mb-3 text-center text-3xl font-semibold text-black dark:text-white">
        {t("list.guests@@Guests")}
      </h1>
      <GuestList userEmail={userEmail.value} openedFromEvent={false} />
    </Speak>
  );
});
