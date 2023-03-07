import {
  component$,
  useBrowserVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { GuestList } from "~/components/guestlist/guestlist";

export default component$(() => {
  const userEmail = useSignal<string>("");
  const navigate = useNavigate();

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => userEmail.value);
    userEmail.value = (await getUser()).data.user?.email ?? "";
    if (userEmail.value === "") {
      navigate(paths.login);
    }
  });

  return (
    <>
      <GuestList userEmail={userEmail.value} openedFromEvent={false} />
    </>
  );
});
