import { component$, useSignal, useClientEffect$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { UserResponse } from "@supabase/supabase-js";
import { paths } from "~/utils/paths";
import { getUser, resetPassword } from "~/utils/supabase.client";

export default component$(() => {
  const email = useSignal("Loading...");
  const input = useSignal<EventTarget & HTMLInputElement>();
  const navigate = useNavigate();

  useClientEffect$(({ track }) => {
    track(() => email.value);
    track(() => input.value);

    getUser().then((userResponse: UserResponse) => {
      if (!userResponse.data.user) {
        navigate.path = paths.login;
      }
      if (userResponse.data.user?.email) {
        email.value = userResponse.data.user.email;
      }
    });
  });

  return (
    <div>
      <p>Email: {email.value}</p>
      <button onClick$={() => resetPassword(email.value)}>
        Change Password
      </button>
    </div>
  );
});
