import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import type { UserResponse } from "@supabase/supabase-js";
import { getUser, resetPassword } from "~/utils/supabase.client";

export default component$(() => {
  const email = useSignal("");

  useTask$(({ track }) => {
    track(() => email.value);
    getUser().then((userResponse: UserResponse) => {
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
