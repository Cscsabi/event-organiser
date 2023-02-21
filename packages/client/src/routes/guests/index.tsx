import {
  component$,
  useClientEffect$,
  useSignal,
  useStyles$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import styles from "~/table.css?inline";
import { GuestList } from "~/components/guestlist/guestlist";

export default component$(() => {
  useStyles$(styles);
  const userEmail = useSignal<string>("");
  const navigate = useNavigate();

  useClientEffect$(async ({ track }) => {
    track(() => userEmail.value);
    userEmail.value = (await getUser()).data.user?.email ?? "";
    if (userEmail.value === "") {
      navigate.path = paths.login;
    }
  });

  return (
    <>
      <GuestList userEmail={userEmail.value} openedFromEvent={false} />
    </>
  );
});
